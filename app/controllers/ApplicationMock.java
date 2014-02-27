package controllers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.io.IOUtils;
import play.api.mvc.Action;
import play.api.mvc.AnyContent;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import views.html.index;

import java.util.List;

public class ApplicationMock extends Controller {


    public static Action<AnyContent> main() {
        return Assets.at("/public/json", "main.json");
    }


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

    public static  Result delete(String environnement, String broker, String queue, String messages) {
        System.out.println(messages);
        return ok("youpi");
    }

    public static Result purge(String environnement, String broker, String queue) {
        return ok("Purged");
    }

    public static Result importFile(String environnement, String broker, String queue) {
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

    public static Result paste(String environnement, String broker, String queue) {
        String msgs=  request().body().asFormUrlEncoded().get("msgs")[0];
        ArrayNode arrayNode = (ArrayNode)Json.parse(msgs);
        System.out.println(msgs);
        return ok("Pasted");
    }


}
