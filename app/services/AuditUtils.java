package services;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mongodb.*;
import com.mongodb.util.JSON;
import org.apache.commons.lang3.*;
import org.xml.sax.SAXParseException;
import play.libs.Json;

import javax.sql.DataSource;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.zip.Inflater;

/**
 * Created by xcigta on 25/02/14.
 */
public class AuditUtils {


    public static ArrayNode auditSearch(String env, String query, int limit) throws Exception {

        SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

        ArrayNode result = Json.newObject().arrayNode();

        MongoClient mongoClient = ESB.getDataSource(env);
        DB audit = mongoClient.getDB("audit");
        DBCollection collection = audit.getCollection("message");

        BasicDBObject find = (BasicDBObject) JSON.parse(query);
        processQuery(find);

        BasicDBObject sort = new BasicDBObject().append("sendDate", -1);
        DBCursor cursor = collection.find(find).sort(sort).limit(limit);
        while (cursor.hasNext()) {

            BasicDBObject dbObject = (BasicDBObject) cursor.next();
            ObjectNode row = result.addObject()
                    .put("id", dbObject.getString("_id"))
                    .put("content", getBody(dbObject))
                    .put("businessId", dbObject.getString("businessId"))
                    .put("processInstanceId", dbObject.getString("processInstanceId"))
                    .put("application", dbObject.getString("application"))
                    .put("domain", dbObject.getString("domain"))
                    .put("context", dbObject.getString("context"))
                    .put("businessUser", dbObject.getString("businessUser"))
                    .put("serviceDestination", dbObject.getString("serviceDestination"))
                    .put("sendDate", sdf.format(dbObject.getDate("sendDate")))
                    .put("type","TextMessage")
                    ;

            ArrayNode properties = row.putArray("properties");


            BasicDBList headers = (BasicDBList) dbObject.get("headers");
            if(headers != null) {
                for (int h = 0; h < headers.size(); h++) {

                    BasicDBObject header = (BasicDBObject) headers.get(h);

                    ObjectNode property = properties.addObject();
                    property.put("name", header.getString("key"));
                    property.put("type", "text");
                    property.put("value", header.getString("value"));

                }
            }
            properties.addObject().put("name", "messageId").put("type", "text").put("value", dbObject.getString("messageId"));
            properties.addObject().put("name", "businessId").put("type", "text").put("value", dbObject.getString("businessId"));
            if(dbObject.getString("businessCorrelationId") != null) {
                properties.addObject().put("name", "businessCorrelationId").put("type", "text").put("value", dbObject.getString("businessCorrelationId"));
            }
            if(dbObject.getString("processInstanceId") != null) {
                properties.addObject().put("name", "processInstanceId").put("type", "text").put("value", dbObject.getString("processInstanceId"));
            }
            properties.addObject().put("name", "application").put("type", "text").put("value", dbObject.getString("application"));
            properties.addObject().put("name", "domain").put("type", "text").put("value", dbObject.getString("domain"));
            properties.addObject().put("name", "context").put("type", "text").put("value", dbObject.getString("context"));
            if(dbObject.getString("businessUser") != null) {
                properties.addObject().put("name", "businessUser").put("type", "text").put("value", dbObject.getString("businessUser"));
            }
            properties.addObject().put("name", "serviceDestination").put("type", "text").put("value", dbObject.getString("serviceDestination"));
            properties.addObject().put("name", "sendDate").put("type", "text").put("value",  sdf.format(dbObject.getDate("sendDate")));

            BasicDBList attachments = (BasicDBList) dbObject.get("attachments");
            if (attachments != null) {

                for (int t=0; t<attachments.size(); t++) {

                    ObjectNode property = properties.addObject();
                    BasicDBObject header = (BasicDBObject) attachments.get(t);

                    property.put("name", "attachment_" + header.getString("name"));
                    property.put("type", "text");
                    property.put("value", header.getString("ref"));

                }


            }

            BasicDBList acks = (BasicDBList) dbObject.get("acks");
            for (int a=0; a<acks.size(); a++) {

                BasicDBObject ack = (BasicDBObject) acks.get(a);

                row.put("ackDate", sdf.format(ack.getDate("ackDate")));
                row.put("ackBy", ack.getString("application"));
                row.put("ackQueue", ack.getString("destination"));

            }

        }

        return result;

    }

    private static String getBody(BasicDBObject dbObject) throws Exception {

        byte[] body = (byte[]) dbObject.get("body");
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "3");
        ByteArrayOutputStream nice = new ByteArrayOutputStream();

        boolean compressed = dbObject.getBoolean("bodyCompressed");
        if (compressed) {

            Inflater inflater = new Inflater();
            inflater.setInput(body);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            while(!inflater.finished()) {
                int byteCount = inflater.inflate(buffer);
                out.write(buffer, 0, byteCount);
            }
            inflater.end();

            try {
                transformer.transform(new StreamSource(new ByteArrayInputStream(out.toByteArray())), new StreamResult(nice));
            } catch (TransformerException e) {
                return new String(body, "UTF-8");
            }

        } else {

            try {
                transformer.transform(new StreamSource(new ByteArrayInputStream(body)), new StreamResult(nice));
            } catch (TransformerException e) {
                return new String(body, "UTF-8");
            }
        }

        return new String(nice.toByteArray(), "UTF-8");

    }

    private static void processQuery(Object o) throws ParseException {

        SimpleDateFormat isosdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

        if (o instanceof BasicDBObject) {

            BasicDBObject b = (BasicDBObject) o;
            for (String key : b.keySet()) {

                Object value = b.get(key);

                 if (StringUtils.containsIgnoreCase(key, "date")) {
                    if (value instanceof BasicDBObject) {
                        BasicDBObject check = (BasicDBObject) b.get(key);
                        for (String checkKey : check.keySet()) {
                            check.put(checkKey, isosdf.parse(check.getString(checkKey)));
                        }
                    } else {
                        b.put(key, isosdf.parse(b.getString(key)));
                    }
                } else if (value instanceof BasicDBObject || value instanceof BasicDBList) {
                    processQuery(value);
                }
            }

        } else if (o instanceof BasicDBList) {

            BasicDBList l = (BasicDBList) o;
            for (int i = 0; i < l.size(); i++) {
                processQuery(l.get(i));
            }
        }
    }

}
