package services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.Lists;
import com.ning.http.util.Base64;
import config.ActiveMQType;
import org.apache.activemq.broker.jmx.BrokerViewMBean;
import org.apache.activemq.broker.jmx.QueueViewMBean;
import org.apache.activemq.command.ActiveMQMessage;
import play.libs.Json;

import javax.jms.*;
import javax.jms.Queue;
import javax.management.JMX;
import javax.management.MBeanServerConnection;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.xml.transform.*;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by xcigta on 21/02/14.
 */
public class BrokerUtils {

    private static String BROKER_OBJECT_NAME = "org.apache.activemq:type=Broker,brokerName=*";
    private static String QUEUE_OBJECT_NAME = "org.apache.activemq:type=Broker,brokerName=%s,destinationType=Queue,destinationName=%s";

    public static ArrayNode getBroker(ActiveMQType activeMQ) throws MalformedObjectNameException, IOException {

        ArrayNode list = Json.newObject().arrayNode();

        JMXConnector connector = ESB.getJmxConnector(activeMQ);
        MBeanServerConnection connection = connector.getMBeanServerConnection();
        ObjectName brokerObjectName = BrokerUtils.getDefaultBroker(connection);
        BrokerViewMBean brokerViewMBean = JMX.newMBeanProxy(connection, brokerObjectName, BrokerViewMBean.class);
        ObjectName[] queueObjectNames = brokerViewMBean.getQueues();
        Arrays.sort(queueObjectNames);
        for (ObjectName queueObjectName : queueObjectNames) {

            String destinationName = queueObjectName.getKeyProperty("destinationName");
            list.add(Json.newObject().put("id", destinationName).put("name", destinationName));
        }

        return list;

    }

    public static ObjectNode getQueue(ActiveMQType activeMQ, String queue) throws MalformedObjectNameException, IOException {

        ObjectNode queueNode = null;

        QueueViewMBean queueViewMBean = getQueueViewMBean(activeMQ, queue);

        queueNode = Json.newObject();
        long queueSize = queueViewMBean.getQueueSize();
        queueNode.put("size", queueSize);

        ArrayNode arrayNode = queueNode.putArray("consumers");
        for (ObjectName subscriptionObjectName : queueViewMBean.getSubscriptions()) {
            arrayNode.add(Json.newObject().put("name", subscriptionObjectName.getKeyProperty("clientId")));
        }
        long consumerCount = queueViewMBean.getConsumerCount();
        queueNode.put("consumersSize", consumerCount);
        queueNode.put("dequeue", queueViewMBean.getDequeueCount());
        queueNode.put("enqueue", queueViewMBean.getEnqueueCount());
        queueNode.put("inflight", queueViewMBean.getInFlightCount());
        queueNode.put("averageEnqueueTime", queueViewMBean.getAverageEnqueueTime());
        queueNode.put("memoryLimit", queueViewMBean.getMemoryLimit());

        if(queueSize > 0 && consumerCount == 0) {
            queueNode.put("status", "WARN");
        } else if(queueSize > 0 && consumerCount > 0) {
            queueNode.put("status", "KO");
        }  else {
            queueNode.put("status", "OK");
        }
        return queueNode;

    }

    private static QueueViewMBean getQueueViewMBean(ActiveMQType activeMQ, String queue) throws MalformedObjectNameException, IOException {

        JMXConnector connector = ESB.getJmxConnector(activeMQ);
        MBeanServerConnection connection = connector.getMBeanServerConnection();
        ObjectName brokerObjectName = BrokerUtils.getDefaultBroker(connection);
        BrokerViewMBean brokerViewMBean = JMX.newMBeanProxy(connection, brokerObjectName, BrokerViewMBean.class);

        String on = String.format(QUEUE_OBJECT_NAME, brokerViewMBean.getBrokerName(), queue);

        return JMX.newMBeanProxy(connection, new ObjectName(on), QueueViewMBean.class);

    }

    public static ArrayNode browse(Connection connection, String queue) throws Exception {

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.S");
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "3");
        ByteArrayOutputStream nice = new ByteArrayOutputStream();

        ArrayNode messages = Json.newObject().arrayNode();

        long count = 1;
        Session s = null;
        QueueBrowser b = null;

        try {

            s = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);

            b = s.createBrowser(s.createQueue(queue));
            Enumeration<Message> enumeration = b.getEnumeration();
            while(enumeration.hasMoreElements()) {


                ActiveMQMessage m = (ActiveMQMessage) enumeration.nextElement();
                List<String> props = Collections.list(m.getAllPropertyNames());
                Collections.sort(props);

                ObjectNode jms = messages.addObject().
                        put("position", count).
                        put("type", m.getClass().getSimpleName()).
                        put("id", m.getJMSMessageID()).
                        put("jmsTimestamp", sdf.format(m.getJMSTimestamp()));


                for (String prop : props) {
                    if (prop.startsWith("JMS")) {
                        if (m.getObjectProperty(prop) != null) {
                            mapPropertyValueFromJms(jms, prop, m, prop);
                        }
                    } else if("businessId".equals(prop)) {
                        jms.put("businessId", m.getStringProperty(prop));
                    }

                }

                ArrayNode properties = jms.putArray("properties");
                for (String prop : props) {

                    if (!prop.startsWith("JMS")) {
                        ObjectNode p = properties.addObject();
                        p.put("name", prop);
                        String type = mapPropertyValueFromJms(p, "value", m, prop);
                        p.put("type", type);
                    }

                }

                if (m instanceof TextMessage) {
                    if (!queue.matches(".*INTERNAL.*")) {
                        try {
                            transformer.transform(new StreamSource(new StringReader(((TextMessage) m).getText())), new StreamResult(nice));
                            jms.put("content", new String(nice.toByteArray(), "UTF-8"));
                        } catch (TransformerException e) {
                            jms.put("content", ((TextMessage) m).getText());
                        }
                    } else {
                        jms.put("content", ((TextMessage) m).getText());
                    }
                }


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

    public static ObjectNode browse(Connection connection, String queue, String jmsMessageId) throws JMSException {

        ObjectNode message = Json.newObject();
        Session s = null;
        QueueBrowser b = null;

        try {

            s = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            b = s.createBrowser(s.createQueue(queue), "JMSMessageID='" + jmsMessageId + "'");

            ObjectNode jms = null;
            Enumeration<Message> enumeration = b.getEnumeration();
            while(enumeration.hasMoreElements()) {


                ActiveMQMessage m = (ActiveMQMessage) enumeration.nextElement();
                List<String> props = Collections.list(m.getAllPropertyNames());
                Collections.sort(props);

                jms = message.putObject("message");

                for (String prop : props) {
                    if (prop.startsWith("JMS")) {
                        if (m.getObjectProperty(prop) != null) {
                            mapPropertyValueFromJms(jms, prop, m, prop);
                        }
                    }
                }

                ArrayNode properties = jms.putArray("properties");
                for (String prop : props) {

                    if (!prop.startsWith("JMS")) {
                        ObjectNode p = properties.addObject();
                        p.put("key", prop);
                        String type = mapPropertyValueFromJms(p, "value", m, prop);
                        p.put("type", type);
                    }

                }

                if (m instanceof TextMessage) {
                    jms.put("text", ((TextMessage) m).getText());
                }


            }

            return message;


        } finally {

            if (b != null) {
                b.close();
            }
            if (s != null) {
                s.close();
            }
        }

    }

    private static ObjectName getDefaultBroker(MBeanServerConnection server) throws MalformedObjectNameException, IOException {

        ObjectName brokerObjectName = new ObjectName(BROKER_OBJECT_NAME);
        Set<ObjectName> brokers = server.queryNames(brokerObjectName, null);
        return brokers.iterator().next();
    }

    private static String mapPropertyValueFromJms(ObjectNode node, String key, ActiveMQMessage m, String property) throws JMSException {

        String type = m.getObjectProperty(property).getClass().getSimpleName();

        switch (type) {

            case "String":
                node.put(key, m.getStringProperty(property));
                break;

            case "Integer":
                node.put(key, m.getIntProperty(property));
                break;

            case "Long":
                node.put(key, m.getLongProperty(property));
                break;

            case "Boolean":
                node.put(key, m.getBooleanProperty(property));
                break;

            case "Float":
                node.put(key, m.getFloatProperty(property));
                break;

            case "Double":
                node.put(key, m.getDoubleProperty(property));
                break;

            case "byte":
                node.put(key, m.getByteProperty(property));
                break;

            case "Short":
                node.put(key, m.getShortProperty(property));
                break;

            default:
                node.put(key, m.getStringProperty(property));

        }

        return type;

    }


    private static void mapPropertyValueToJms(Message m, ArrayList<JsonNode> properties) throws JMSException {


        for (JsonNode property : properties) {

            String key = property.get("name").asText();
            String type = property.get("type").asText();

            switch (type) {

                case "String":
                    m.setStringProperty(key, property.get("value").textValue());
                    break;

                case "Integer":
                    m.setIntProperty(key, property.get("value").intValue());
                    break;

                case "Long":
                    m.setLongProperty(key, property.get("value").longValue());
                    break;

                case "Boolean":
                    m.setBooleanProperty(key, property.get("value").booleanValue());
                    break;

                case "Float":
                    m.setFloatProperty(key, property.get("value").floatValue());
                    break;

                case "Double":
                    m.setDoubleProperty(key, property.get("value").doubleValue());
                    break;

                case "byte":
                    m.setByteProperty(key, Base64.decode(property.get("value").textValue())[0]);
                    break;

                case "Short":
                    m.setShortProperty(key, property.get("value").shortValue());
                    break;

                default:
                    m.setStringProperty(key, property.get("value").toString());


            }
        }
    }

    public static String paste(Connection connection, String queue, ArrayNode arrayNode) throws JMSException {

        long count = 0;
        ObjectNode info = Json.newObject().put("result", "done");
        Session s = null;
        MessageProducer mp = null;

        try {

            s = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            Queue q = s.createQueue(queue);
            mp = s.createProducer(q);

            for(JsonNode msg : arrayNode) {

                String type = msg.get("type").textValue();
                String content = msg.get("content").textValue();

                if (type.contains("TextMessage")) {

                    TextMessage tm = s.createTextMessage(content);

                    mapPropertyValueToJms(tm, Lists.newArrayList(msg.get("properties").elements()));

                    mp.send(tm);

                    count++;
                }

            }

        } finally {

            if (mp != null) {
                mp.close();
            }

            if (s != null) {
                s.close();
            }

        }

        return count + " message(s) pasted.";
    }


    public static String delete(Connection connection, String queue, JsonNode node) throws JMSException {

        long count = 0;
        Session s = null;

        try {

        s = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Queue q = s.createQueue(queue);


            for (JsonNode msgIdNode : Lists.newArrayList(node.iterator())) {

                String msgId = msgIdNode.asText();
                MessageConsumer mc = null;
                try {

                    mc = s.createConsumer(s.createQueue(queue), "JMSMessageID='" + msgId + "'");
                    Message m = mc.receive(5000);
                    if (m != null) {
                        count++;
                    }

                } finally {
                    if (mc != null) {
                        mc.close();
                    }
                }
            }

        } finally {

            if (s != null) {
                s.close();
            }

        }

        return count + " message(s) deleted.";

    }

    public static String purge(ActiveMQType activeMQ, String queue) throws Exception {

        QueueViewMBean queueMBean = getQueueViewMBean(activeMQ, queue);

        long before = queueMBean.getQueueSize();
        queueMBean.purge();
        long after = queueMBean.getQueueSize();

        return (before - after) + " messages purged.";

    }

    public static String move(ActiveMQType sourceBroker, String sourceQueue, ActiveMQType targetBroker, String targetQueue, ArrayNode messages) throws JMSException {

        assert sourceQueue != null && targetQueue != null : "queue can not be null";
        assert !sourceBroker.getJmsUrl().equals(targetBroker.getJmsUrl()) && !sourceQueue.equals(targetQueue) : "you cannot move messages on same destination";

        long count = 0;
        Connection sourceConnection = ESB.getConnection(sourceBroker);
        Connection targetConnection = ESB.getConnection(targetBroker);
        Session sourceSession = null;
        Session targetSession = null;
        MessageProducer mp = null;

        try {

            sourceSession = sourceConnection.createSession(true, Session.SESSION_TRANSACTED);
            targetSession = targetConnection.createSession(true, Session.SESSION_TRANSACTED);
            mp = targetSession.createProducer(targetSession.createQueue(targetQueue));

            for(JsonNode msgIdNode : messages) {

                String msgId = msgIdNode.asText();
                MessageConsumer mc = sourceSession.createConsumer(sourceSession.createQueue(sourceQueue), "JMSMessageID='" + msgId + "'");
                Message m = mc.receive(5000);

                if (m != null) {
                    mp.send(m);
                    //sourceSession.commit();
                    count++;
                }

            }

            targetSession.commit();
            sourceSession.commit();

        } finally {

            if (mp != null) {
                mp.close();
            }

            if (targetSession != null) {
                targetSession.close();
            }

            if (sourceSession != null) {
                sourceSession.close();
            }
        }


        return count + " message(s) moved.";

    }

    public static String moveAll(ActiveMQType sourceBroker, String sourceQueue, ActiveMQType targetBroker, String targetQueue) throws Exception {

        if (sourceQueue == null || targetQueue == null) {
            throw new Exception("queue can not be null");
        }

        if (sourceBroker.getJmsUrl().equals(targetBroker.getJmsUrl()) && sourceQueue.equals(targetQueue)) {
            throw new Exception("you cannot move messages on same destination");
        }
        
        long count = 0;
        Connection sourceConnection = ESB.getConnection(sourceBroker);
        Connection targetConnection = ESB.getConnection(targetBroker);

        Session sourceSession = null;
        Session targetSession = null;
        MessageConsumer mc = null;
        MessageProducer mp = null;




        try {

            sourceSession = sourceConnection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            targetSession = targetConnection.createSession(false, Session.AUTO_ACKNOWLEDGE);

            mc = sourceSession.createConsumer(sourceSession.createQueue(sourceQueue));
            mp = targetSession.createProducer(targetSession.createQueue(targetQueue));
            Message m = null;

            while((m = mc.receive(5000)) != null) {

                if (m != null) {
                    mp.send(m);
                    count++;
                }

            }

        } finally {

            if (mp != null) {
                mp.close();
            }

            if (targetSession != null) {
                targetSession.close();
            }


            if (mc != null) {
                mc.close();
            }

            if (sourceSession != null) {
                sourceSession.close();
            }
        }


        return count + " message(s) moved.";
    }

}


