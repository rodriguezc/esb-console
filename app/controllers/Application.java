package controllers;

import org.apache.commons.io.IOUtils;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.index;

import java.io.FileReader;
import java.io.IOException;

public class Application extends Controller {

    public static Result index() {
        return ok(index.render("Your new application is ready."));
    }

    public static Result environnements() {
        try {
            return ok(IOUtils.toString(new FileReader("public/json/environnements.json")));
        } catch (IOException e) {
            e.printStackTrace();
        }

        return internalServerError();
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

    public static Result messages(String environnement, String broker, String queue) {
        try {
            return ok(IOUtils.toString(new FileReader("public/json/messages.json")));
        } catch (IOException e) {
            e.printStackTrace();
        }
        return internalServerError();
    }
}
