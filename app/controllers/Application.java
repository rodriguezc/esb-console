package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import config.ActiveMQType;
import config.EsbType;
import config.JmxServerType;
import config.ServiceMixType;
import org.apache.activemq.broker.jmx.BrokerViewMBean;
import org.apache.activemq.broker.jmx.QueueViewMBean;
import org.apache.commons.io.IOUtils;
import play.Logger;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import services.BrokerUtils;
import services.ESB;
import views.html.index;

import javax.jms.Connection;
import javax.jms.JMSException;
import javax.management.*;
import javax.management.remote.JMXConnector;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public class Application extends Controller {

    public static Result index() {
        return ok(index.render("Your new application is ready."));
    }

    public static Result environnements() {

        ObjectNode env = Json.newObject();
        ArrayNode environnements = env.putArray("environnements");
        List<EsbType> esbTypes = ESB.config.getEnvironnement ();
        for (EsbType esbType : esbTypes) {

            ObjectNode node = Json.newObject();
            node.put("name", esbType.getLabel());
            node.putArray("pagesGranted").add("Audit").add("Erreurs").add("Info queues").add("Composants").add("Hermes like");

            ArrayNode containers = node.putArray("containers");
            List<ServiceMixType> serviceMixTypes = esbType.getServiceMix();
            for (ServiceMixType serviceMixType: serviceMixTypes) {
                containers.add(esbType.getName() + serviceMixType.getNode());
            }

            ArrayNode brokers = node.putArray("brokers");
            List<ActiveMQType> activeMQTypes = esbType.getActivemq();
            for (ActiveMQType activeMQType : activeMQTypes) {
                brokers.add(esbType.getName() + activeMQType.getNode());
            }

            environnements.add(node);

        }

        return ok(env);

    }

    public static Result broker(String environnement, String broker) {

        ArrayNode list = Json.newObject().arrayNode();

        try {
            ActiveMQType activeMQ = ESB.getActiveMQByLabel(environnement, broker);
            if (activeMQ != null) {

                JMXConnector connector = ESB.getJmxConnector(activeMQ);
                MBeanServerConnection connection = connector.getMBeanServerConnection();
                ObjectName brokerObjectName = BrokerUtils.getDefaultBroker(connection);
                BrokerViewMBean brokerViewMBean = JMX.newMBeanProxy(connection, brokerObjectName, BrokerViewMBean.class);
                ObjectName[] queueObjectNames = brokerViewMBean.getQueues();
                for (ObjectName queueObjectName : queueObjectNames) {

                    list.add(Json.newObject().put("name", queueObjectName.getKeyProperty("destinationName")));
                }

                return ok(list);

            } else {

                return notFound("No broker " + broker);
            }

        } catch (Exception e) {
            Logger.error(e.getMessage(),e);
            return internalServerError(e.getMessage());
        }


    }

        /*
{
    "size": 20,
    "consumers": [
        {
            "name": "christophe"
        },
        {
            "name": "giampaolo"
        }
    ],
    "consumersSize": 2,
    "dequeue": 6,
    "enqueue": 2,
    "inflight": 1,
    "averageEnqueueTime": 100,
    "memoryLimit": 1048576
}
    */


    public static Result queue(String environnement, String broker, String queue) {

        try {
            ActiveMQType activeMQ = ESB.getActiveMQByLabel(environnement, broker);
            if (activeMQ != null) {

                JMXConnector connector = ESB.getJmxConnector(activeMQ);
                MBeanServerConnection connection = connector.getMBeanServerConnection();
                ObjectName brokerObjectName = BrokerUtils.getDefaultBroker(connection);
                BrokerViewMBean brokerViewMBean = JMX.newMBeanProxy(connection, brokerObjectName, BrokerViewMBean.class);
                ObjectName[] queueObjectNames = brokerViewMBean.getQueues();
                for (ObjectName queueObjectName : queueObjectNames) {

                    if (queueObjectName.getKeyProperty("destinationName").equals(queue)) {

                        QueueViewMBean queueViewMBean = JMX.newMBeanProxy(connection, queueObjectName, QueueViewMBean.class);

                        ObjectNode queueNode = Json.newObject();
                        queueNode.put("size", queueViewMBean.getQueueSize());

                        ArrayNode arrayNode = queueNode.putArray("consumers");
                        for (ObjectName subscriptionObjectName : queueViewMBean.getSubscriptions()) {
                            arrayNode.add(Json.newObject().put("name", subscriptionObjectName.getKeyProperty("clientId")));
                        }
                        queueNode.put("consumersSize", queueViewMBean.getConsumerCount());
                        queueNode.put("dequeue", queueViewMBean.getDequeueCount());
                        queueNode.put("enqueue", queueViewMBean.getEnqueueCount());
                        queueNode.put("inflight", queueViewMBean.getInFlightCount());
                        queueNode.put("averageEnqueueTime", queueViewMBean.getAverageEnqueueTime());
                        queueNode.put("memoryLimit", queueViewMBean.getMemoryLimit());

                        return ok(queueNode);

                    }

                }

                return notFound("No queue " + queue);

            } else {

                return notFound("No broker " + broker);

            }

        } catch (Exception e) {
            Logger.error(e.getMessage(),e);
            return internalServerError(e.getMessage());
        }
    }

    public static Result messages(String environnement, String broker, String queue) {

        try {

            Connection connection = ESB.getConnection(ESB.getActiveMQByLabel(environnement, broker));
            return ok(BrokerUtils.browse(connection, queue));

        } catch (JMSException e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }
    }

}
