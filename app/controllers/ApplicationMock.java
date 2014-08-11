package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import play.api.mvc.Action;
import play.api.mvc.AnyContent;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

public class ApplicationMock extends Controller {


    public static Action<AnyContent> main() {
        return Assets.at("/websrc/json", "main.json");
    }

    public static Action<AnyContent> environments() {
        return Assets.at("/websrc/json", "environments.json");
    }



    public static  Action<AnyContent> queues(String environment, String broker) {
        return Assets.at("/websrc/json", "queues.json");
    }

    public static  Action<AnyContent> queue(String environment, String broker, String queue) {
        return Assets.at("/websrc/json", "queue.json");
    }

    public static  Action<AnyContent> messages(String environment, String broker, String queue) {
        return Assets.at("/websrc/json", "messages.json");
    }

    public static  Result delete(String environment, String broker, String queue) {
        ArrayNode msgsIdJson= (ArrayNode)request().body().asJson();
        return ok(msgsIdJson.size()+" messages deleted");
    }

    public static Result purge(String environment, String broker, String queue) {
        return ok("x messages purged");
    }

    public static Result importFile(String environment, String broker, String queue) {
        List<Http.MultipartFormData.FilePart> files = request().body().asMultipartFormData().getFiles();

        //https://github.com/dojo/dojox/blob/master/form/tests/UploadFile.php.disabled pour plus d'infos sur ce qu'il faut retourner
        ArrayNode arrayNode = new Json().newObject().arrayNode();
        for(Http.MultipartFormData.FilePart filePart : files) {
            ObjectNode queueNode = Json.newObject();
            queueNode.put("file", filePart.getFilename());
            queueNode.put("name", filePart.getFilename());
            queueNode.put("type", filePart.getContentType());
            queueNode.put("uploadType", filePart.getContentType());
            queueNode.put("size", filePart.getFile().length());
            arrayNode.add(queueNode);

        }
        System.out.println(arrayNode.toString());
        return ok(arrayNode.toString());
    }

    public static Result paste(String environment, String broker, String queue) {
        ArrayNode msgs = (ArrayNode) request().body().asJson();
        System.out.println(msgs);
        return ok(msgs.size()+" Pasted");
    }

    public static Result moveSelection(String environment, String broker, String queue) {
        JsonNode objectNode =  request().body().asJson();
        String destEnv = objectNode.get("destination").get("env").asText();
        String destBroker = objectNode.get("destination").get("broker").asText();
        String destQueue = objectNode.get("destination").get("queue").asText();
        ArrayNode messages = (ArrayNode) objectNode.get("msgs");
        for(JsonNode node : messages)  {
            String msgId = node.asText();
            System.out.println(msgId);
        }
        System.out.println(destEnv+" - "+destBroker+" "+destQueue+" "+messages);
        return ok(messages.size()+ " selection moved");
    }

    public static Result moveAll(String environment, String broker, String queue) {
        JsonNode objectNode =  request().body().asJson();
        String destEnv = objectNode.get("destination").get("env").asText();
        String destBroker = objectNode.get("destination").get("broker").asText();
        String destQueue = objectNode.get("destination").get("queue").asText();

        System.out.println(destEnv+" - "+destBroker+" "+destQueue);
        return ok("All moved to the queue "+destEnv+" - "+destBroker+" "+destQueue);
    }



    public static Action<AnyContent> brokers(String environment) {
        return Assets.at("/websrc/json", "brokers.json");
    }

    public static Action<AnyContent> queuesStats(String environment) {
        return Assets.at("/websrc/json", "queuesStats.json");
    }

    public static Action<AnyContent> bundles(String environment) {
        return Assets.at("/websrc/json", "bundles.json");
    }

    public static Action<AnyContent> auditSearch(String environment) {
        return Assets.at("/websrc/json", "audit.json");
    }

    public static AtomicBoolean switchMonitoring = new AtomicBoolean();

    public static Action<AnyContent> monitoringState() {
        if(switchMonitoring.get()) {
            switchMonitoring.set(!switchMonitoring.get());
            return Assets.at("/websrc/json", "monitoring2.json");
        } else {
            switchMonitoring.set(!switchMonitoring.get());
            return Assets.at("/websrc/json", "monitoring.json");
        }

    }
}
