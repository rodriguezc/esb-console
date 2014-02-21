package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import config.ActiveMQType;
import config.EsbType;
import config.ServiceMixType;
import org.apache.commons.io.IOUtils;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import services.ESB;
import views.html.index;

import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

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
        try {
            System.out.println("environnement = " + environnement);
            System.out.println("broker = " + broker);


            System.out.println("queueNameSearch = " + request().getQueryString("name"));
            return ok(IOUtils.toString(new FileReader("public/json/queues.json")));
        } catch (IOException e) {
            e.printStackTrace();
        }

        return internalServerError();
    }

    public static Result queue(String environnement, String broker, String queue) {
        try {
            return ok(IOUtils.toString(new FileReader("public/json/publierTaxation.json")));
        } catch (IOException e) {
            e.printStackTrace();
        }
        return internalServerError();
    }
}
