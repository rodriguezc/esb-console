package controllers;

import play.api.mvc.Action;
import play.api.mvc.AnyContent;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.index;

public class ApplicationMock extends Controller {

    public static Result index() {
        return ok(index.render("Your new application is ready."));
    }

    public static Action<AnyContent> environnements() {
        return Assets.at("/public/json", "environnements.json");
    }

    public static  Action<AnyContent> broker(String environnement, String broker) {
        return Assets.at("/public/json", "queues.json");
    }

    public static  Action<AnyContent> queue(String environnement, String broker, String queue) {
        return Assets.at("/public/json", "publierTaxation.json");
    }

    public static  Action<AnyContent> messages(String environnement, String broker, String queue) {
        return Assets.at("/public/json", "messages.json");
    }

}
