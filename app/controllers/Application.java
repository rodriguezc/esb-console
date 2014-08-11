package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import config.ActiveMQType;
import config.EsbType;
import config.ServiceMixType;
import org.apache.activemq.broker.Broker;
import play.Logger;
import play.api.mvc.Action;
import play.api.mvc.AnyContent;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import scala.util.parsing.json.JSON;
import services.*;

import javax.jms.Connection;
import javax.jms.JMSException;
import javax.management.MalformedObjectNameException;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

public class Application extends Controller {

    public static Result main() {

        ObjectNode env = Json.newObject();
        env.putObject("application").put("user", "xsicrz").put("version", "1.0").put("environment", "DEV");
        env.putObject("monitoring").put("globalState", "OK").put("Monitoring: All systems are working correctly", "1.0");

        ArrayNode environments = env.putArray("environments");
        List<EsbType> esbTypes = ESB.config.getEnvironnement();

        for (EsbType esbType : esbTypes) {

            ObjectNode node = Json.newObject();
            environments.add(node);
            node.put("id", esbType.getName());
            node.put("name", esbType.getLabel());
            ArrayNode pagesGranted = node.putArray("pagesGranted");
            pagesGranted.addObject().put("id", "audit").put("name", "Audit");
            pagesGranted.addObject().put("id", "bundles").put("name", "Bundles");
            pagesGranted.addObject().put("id", "queuesStats").put("name", "Queues stats");
            pagesGranted.addObject().put("id", "jmsBrowser").put("name", "JMS Browser");


            ArrayNode brokers = node.putArray("brokers");


            List<ActiveMQType> activeMQTypes = esbType.getActivemq();
            for (ActiveMQType activeMQType : activeMQTypes) {
                brokers.addObject().
                        put("id", activeMQType.getNode()).
                        put("name", activeMQType.getNode());
            }
        }
        return ok(env);
    }

    public static Result environments() {
        ArrayNode env = Json.newObject().arrayNode();
        List<EsbType> esbTypes = ESB.config.getEnvironnement();
        for (EsbType esbType : esbTypes) {

            env.addObject().
                    put("id", esbType.getName()).
                    put("name", esbType.getLabel());

        }

        return ok(env);
    }

    public static Result brokers(String environments) {

        ArrayNode brokersList = Json.newObject().arrayNode();
        for (ActiveMQType a : ESB.getBrokers(environments)) {

            brokersList.addObject().
                    put("id", a.getNode()).
                    put("name", a.getNode());
        }

        return ok(brokersList);

    }

    public static Result queues(String environments, String broker) {

        try {
            ActiveMQType activeMQ = ESB.getActiveMQ(environments, broker);
            if (activeMQ != null) {

                return ok(BrokerUtils.getBroker(activeMQ));

            } else {

                return notFound("No broker " + broker);
            }

        } catch (Exception e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }
    }

    public static Result queue(String environments, String broker, String queue) {

        try {
            ActiveMQType activeMQ = ESB.getActiveMQ(environments, broker);
            if (activeMQ != null) {

                ObjectNode queueNode = BrokerUtils.getQueue(activeMQ, queue);
                if (queueNode != null) {

                    return ok(queueNode);

                } else {

                    return notFound("No queue " + queue);
                }

            } else {

                return notFound("No broker " + broker);

            }

        } catch (Exception e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }
    }

    public static Result messages(String environments, String broker, String queue) {

        try {

            Connection connection = ESB.getConnection(ESB.getActiveMQ(environments, broker));
            return ok(BrokerUtils.browse(connection, queue));

        } catch (Exception e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }
    }

    public static Result paste(String environments, String broker, String queue) {

        try {

            ArrayNode arrayNode = (ArrayNode) request().body().asJson();

            Connection connection = ESB.getConnection(ESB.getActiveMQ(environments, broker));
            return ok(BrokerUtils.paste(connection, queue, arrayNode));

        } catch (JMSException e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }

    }

    public static Result moveSelection(String environment, String broker, String sourceQueue) {
        JsonNode objectNode = request().body().asJson();


        ActiveMQType sourceBroker = ESB.getActiveMQ(environment, broker);

        String destEnv = objectNode.get("destination").get("env").asText();
        String destBroker = objectNode.get("destination").get("broker").asText();
        String targetQueue = objectNode.get("destination").get("queue").asText();

        ActiveMQType targetBroker = ESB.getActiveMQ(destEnv, destBroker);

        ArrayNode messages = (ArrayNode) objectNode.get("msgs");

        try {
            return ok(BrokerUtils.move(sourceBroker, sourceQueue, targetBroker, targetQueue, messages));
        } catch (Exception e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }


    }


    public static Result moveAll(String environment, String broker, String sourceQueue) {

        JsonNode objectNode = request().body().asJson();

        ActiveMQType sourceBroker = ESB.getActiveMQ(environment, broker);

        String destEnv = objectNode.get("destination").get("env").asText();
        String destBroker = objectNode.get("destination").get("broker").asText();
        String targetQueue = objectNode.get("destination").get("queue").asText();

        ActiveMQType targetBroker = ESB.getActiveMQ(destEnv, destBroker);

        try {
            return ok(BrokerUtils.moveAll(sourceBroker, sourceQueue, targetBroker, targetQueue));
        } catch (Exception e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }
    }

    public static Result purge(String environments, String broker, String queue) {
        try {
            ActiveMQType activeMQ = ESB.getActiveMQ(environments, broker);
            if (activeMQ != null) {

                return ok(BrokerUtils.purge(activeMQ, queue));
            } else {
                return notFound();
            }
        } catch (Exception e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }
    }

    public static Result delete(String environments, String broker, String queue) {
        try {

            Connection connection = ESB.getConnection(ESB.getActiveMQ(environments, broker));
            return ok(BrokerUtils.delete(connection, queue, request().body().asJson()));

        } catch (JMSException e) {
            Logger.error(e.getMessage(), e);
            return internalServerError(e.getMessage());
        }
    }

    public static Result importFile(String environments, String broker, String queue) {
        return play.mvc.Results.TODO;
    }

    public static Result queuesStats(String environments) throws Exception {

        List<ActiveMQType> amqList = ESB.getBrokers(environments);

        Map<String, ObjectNode> queuesMap = new HashMap<String, ObjectNode>();
        for (ActiveMQType amq : amqList) {
            ArrayNode queues = BrokerUtils.getBroker(amq);
            Iterator<JsonNode> queuesIt = queues.iterator();
            while (queuesIt.hasNext()) {
                String queue = queuesIt.next().get("id").asText();
                ObjectNode queuesStats = BrokerUtils.getQueue(amq, queue);
                int size = queuesStats.get("size").asInt();

                String status = queuesStats.get("status").asText();


                ObjectNode queueStatsNode = queuesMap.get(queue);
                if (queueStatsNode == null) {
                    queueStatsNode = Json.newObject();
                    queuesMap.put(queue, queueStatsNode);
                }

                queueStatsNode.put("id", queue);
                queueStatsNode.put("name", queue);

                //Agréger résultat
                if (queueStatsNode.get("size") != null) {
                    queueStatsNode.put("size", size + queueStatsNode.get("size").asInt());
                } else {
                    queueStatsNode.put("size", size);
                }

                if (queueStatsNode.get("status") != null) {
                    String currentStatus = queueStatsNode.get("status").asText();
                    if ("OK".equals(currentStatus)) {
                        queueStatsNode.put("status", status);
                    } else if ("WARN".equals(currentStatus) && "KO".equals(status)) {
                        queueStatsNode.put("status", status);
                    }
                } else {
                    queueStatsNode.put("status", status);
                }


                ArrayNode brokersNode = (ArrayNode) queueStatsNode.get("brokers");
                if (brokersNode == null) {
                    brokersNode = queueStatsNode.putArray("brokers");
                }
                ObjectNode brokerStatsNode = brokersNode.addObject();
                brokerStatsNode.put("id", amq.getNode());
                brokerStatsNode.put("name", amq.getNode());
                brokerStatsNode.put("stats", queuesStats);
            }
        }


        List<ObjectNode> queuesOrdered = new ArrayList<>(queuesMap.values());


        ArrayNode list = Json.newObject().arrayNode();
        for (ObjectNode node : queuesOrdered) {
            list.add(node);
        }

        return ok(list);
    }

    public static Result bundles(String environments) throws Exception {
        ArrayNode result = Json.newObject().arrayNode();

        List<ServiceMixType> serviceMixTypeList = ESB.getServiceMix(environments);
        for (ServiceMixType serviceMix : serviceMixTypeList) {
            ArrayNode serviceMixList = ContainerUtils.getBundles(serviceMix);
            result.addAll(serviceMixList);
        }
        return ok(result);
    }

    public static Result monitoringState() throws Exception {

        JsonNode source = Json.parse(MonitorClientService.getInstance().getData());

        Date dateCheck = new Date(source.get("dateCheck").asLong());
        ObjectNode node = Json.newObject();

        node.put("lastUpdate", new SimpleDateFormat("dd.MM.yyyy HH:mm:ss").format(dateCheck));
        String statut = source.get("statut").asText();
        node.put("globalState", statut);

        ArrayNode states = node.putArray("state");

        int nbSystemsInError = 0;
        int nbSystemsInWarn = 0;

        int maxSys = 0;
        {
            ArrayNode environnements = (ArrayNode) source.get("environnements");
            Iterator<JsonNode> itEnv = environnements.iterator();
            while (itEnv.hasNext()) {
                ObjectNode environnement = (ObjectNode) itEnv.next();
                ArrayNode systemes = (ArrayNode) environnement.get("systemes");
                if (maxSys < systemes.size()) {
                    maxSys = systemes.size();
                }
            }
        }


        ArrayNode environnements = (ArrayNode) source.get("environnements");

        Iterator<JsonNode> itEnv = environnements.iterator();

        while (itEnv.hasNext()) {
            ObjectNode environnement = (ObjectNode) itEnv.next();

            ObjectNode state = states.addObject();
            state.put("name", environnement.get("nom").asText());
            state.put("stateClass", "STATE_" + environnement.get("statut").asText());


            ArrayNode systems = state.putArray("systems");

            ArrayNode systemes = (ArrayNode) environnement.get("systemes");

            Iterator<JsonNode> itSys = systemes.iterator();
            while (itSys.hasNext()) {
                ObjectNode sourceSys = (ObjectNode) itSys.next();
                ObjectNode system = systems.addObject();

                system.put("name", sourceSys.get("nom").asText());

                ObjectNode sysStatut = (ObjectNode) sourceSys.get("statut");
                ObjectNode gauge = (ObjectNode) sysStatut.get("gauge");
                system.put("value", gauge.get("value").asText() +"/"+gauge.get("maxValue").asText()+gauge.get("uniteMesure").asText());
                String systemStatus = sysStatut.get("statut").asText();
                system.put("stateClass", "STATE_"+ systemStatus);
                String message = sysStatut.get("message").asText();
                system.put("info", message !=  null ? message : "");

                if("ERROR".equals(systemStatus)) {
                    ++nbSystemsInError;
                } else if ("WARN".equals(systemStatus)) {
                    ++nbSystemsInWarn;
                }
            }
            if(systemes.size() < maxSys) {
                for(int i = 0; i< (maxSys - systemes.size()); i++){
                    ObjectNode system = systems.addObject();
                    system.put("name", "/");
                }
            }


        }

        if ("OK".equals(statut)) {
            node.put("globalInfo", "Everything is under control");
        } else  {
            node.put("globalInfo", nbSystemsInError + " systems in error, "+ nbSystemsInWarn +" systems in warn.");
        }
        return ok(node);
    }

    public static Result auditSearch(String environment) throws Exception {

        return ok(AuditUtils.auditSearch(environment, request().body().asText()));
    }


}