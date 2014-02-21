package services;

import com.fasterxml.jackson.databind.node.ArrayNode;
import play.libs.Json;

import javax.jms.*;
import javax.management.MBeanServerConnection;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Set;

/**
 * Created by xcigta on 21/02/14.
 */
public class BrokerUtils {

    protected static String BROKER_OBJECT_NAME = "org.apache.activemq:BrokerName=*,Type=Broker";
    protected static String BROKER_OBJECT_NAME_JBOSS = "org.apache.activemq:type=Broker,brokerName=*";

    public static Set<ObjectName> getBrokers(MBeanServerConnection server) throws MalformedObjectNameException, IOException {

        ObjectName brokerObjectName = new ObjectName(BROKER_OBJECT_NAME);
        Set<ObjectName> brokers = server.queryNames(brokerObjectName, null);

        if (brokers.size() == 0) {
            brokerObjectName = new ObjectName(BROKER_OBJECT_NAME_JBOSS);
            brokers = server.queryNames(brokerObjectName, null);
        }

        return brokers;
    }

    public static ObjectName getDefaultBroker(MBeanServerConnection server) throws MalformedObjectNameException, IOException {
        return getBrokers(server).iterator().next();
    }

    /*
    [
    {"position": 1, "type": "TextMessage", "jmsMessageId": "ID:1", "jmsTimestamp" : "18.11.2013 10:05"},
    {"position": 2, "type": "TextMessage", "jmsMessageId": "ID:2", "jmsTimestamp" :"18.11.2013 10:06"},
    {"position": 3, "type": "TextMessage", "jmsMessageId": "ID:12345", "jmsTimestamp" :"18.11.2013 10:07"},
    {"position": 4, "type": "TextMessage", "jmsMessageId": "ID:12345", "jmsTimestamp" : "18.11.2013 10:08"}
]

     */


    public static ArrayNode browse(Connection connection, String queue) throws JMSException {

        ArrayNode messages = Json.newObject().arrayNode();

        long count = 1;
        Session s = null;
        QueueBrowser b = null;

        try {

            s = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            b = s.createBrowser(s.createQueue(queue));
            Enumeration<Message> enumeration = b.getEnumeration();
            while(enumeration.hasMoreElements()) {
                Message m = enumeration.nextElement();
                    messages.add(Json.newObject().
                            put("position", count).
                            put("type", m.getClass().getSimpleName()).
                            put("jmsMessageId", m.getJMSMessageID()).
                            put("jmsTimestamp", m.getJMSTimestamp())
                    );

                    count++;
            }

            return messages;

        } finally {

            if (b != null) {
                b.close();
            }
            if (s != null) {
                s.close();
            }
        }


    }

}


