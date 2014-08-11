package services;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mongodb.*;
import com.mongodb.util.JSON;
import play.libs.Json;

import javax.sql.DataSource;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.zip.Inflater;

/**
 * Created by xcigta on 25/02/14.
 */
public class AuditUtils {


    public static ArrayNode auditSearch(String env, String query) throws Exception {

        SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

        ArrayNode result = Json.newObject().arrayNode();

        MongoClient mongoClient = ESB.getDataSource(env);
        DB audit = mongoClient.getDB("audit");
        DBCollection collection = audit.getCollection("message");

        BasicDBObject sort = new BasicDBObject().append("sendDate", -1);
        DBCursor cursor = collection.find((DBObject) JSON.parse(query)).sort(sort).limit(100);
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
                    .put("serviceDestination", dbObject.getString("destination"))
                    .put("sendDate", sdf.format(dbObject.getDate("sendDate")));

            ArrayNode properties = row.putArray("properties");


            BasicDBList headers = (BasicDBList) dbObject.get("headers");
            for (int h=0; h<headers.size(); h++) {

                BasicDBObject header = (BasicDBObject) headers.get(h);

                ObjectNode property = properties.addObject();
                property.put("name", header.getString("key"));
                property.put("type", "text");
                property.put("value", header.getString("value"));

            }

            BasicDBList attachments = (BasicDBList) dbObject.get("attachments");
            if (attachments != null) {

                for (int t=0; t<attachments.size(); t++) {

                    ObjectNode property = properties.addObject();
                    BasicDBObject header = (BasicDBObject) attachments.get(t);

                    property.put("name", "attachment[" + header.getString("name") + "]");
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

            transformer.transform(new StreamSource(new ByteArrayInputStream(out.toByteArray())), new StreamResult(nice));

        } else {

            transformer.transform(new StreamSource(new ByteArrayInputStream(body)), new StreamResult(nice));
        }

        return new String(nice.toByteArray(), "UTF-8");

    }


}
