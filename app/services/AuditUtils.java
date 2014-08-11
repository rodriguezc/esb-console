package services;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mongodb.*;
import com.mongodb.util.JSON;
import play.libs.Json;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Created by xcigta on 25/02/14.
 */
public class AuditUtils {


    public static ArrayNode auditSearch(String env, String query) throws Exception {

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
                    .put("content", dbObject.getString("body"))
                    .put("businessId", dbObject.getString("businessId"))
                    .put("processInstanceId", dbObject.getString("processInstanceId"))
                    .put("application", dbObject.getString("application"))
                    .put("domain", dbObject.getString("domain"))
                    .put("context", dbObject.getString("context"))
                    .put("businessUser", dbObject.getString("businessUser"))
                    .put("serviceDestination", dbObject.getString("destination"))
                    .put("sendDate", dbObject.getString("sendDate"));

            ArrayNode properties = row.putArray("properties");

            BasicDBList headers = (BasicDBList) dbObject.get("headers");
            for (int h=0; h<headers.size(); h++) {

                ObjectNode property = properties.addObject();
                BasicDBObject header = (BasicDBObject) headers.get(h);

                property.put("name", header.getString("key"));
                property.put("type", "text");
                property.put("value", header.getString("value"));

            }

            BasicDBList acks = (BasicDBList) dbObject.get("acks");
            for (int a=0; a<acks.size(); a++) {

                BasicDBObject ack = (BasicDBObject) acks.get(a);

                row.put("ackDate", ack.getString("ackDate"));
                row.put("ackBy", ack.getString("application"));
                row.put("ackQueue", ack.getString("destination"));

            }

        }

        return result;

    }

    private String getBody(BasicDBObject dbObject) {

        boolean compressed = dbObject.getBoolean("compressed");
        if (compressed) {

        }

        return null;

    }


}
