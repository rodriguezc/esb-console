package services;

import org.apache.commons.io.IOUtils;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.eclipse.jetty.websocket.client.WebSocketClient;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

/**
 * Created by xsicrz on 11.08.14.
 */
@WebSocket(maxTextMessageSize = 64 * 1024)
public class MonitorClientService {


    private static MonitorClientService instance = null;


    private static volatile Object LOCK =new Object();


    public static MonitorClientService getInstance() throws Exception {
        if (instance == null) {
            synchronized (LOCK) {
                if(instance == null)  {
                    instance =  new MonitorClientService();
                    instance.initialize();
                }
            }
        }
        return instance;
    }


    private String data = null;

    public String getData() {
        return data;
    }

    public void initialize() throws Exception {

        URL smartMonitorUrl = new URL("http://"+ ESB.getMonitoringHostAndPort()+"/services/data.json");

        HttpURLConnection connection = (HttpURLConnection) smartMonitorUrl.openConnection();

        data = IOUtils.toString(connection.getInputStream());
        connection.disconnect();



        WebSocketClient client = new WebSocketClient();
        client.start();
        URI monitorURI = new URI("ws://"+ESB.getMonitoringHostAndPort());
        client.connect(this, monitorURI);
    }


    @SuppressWarnings("unused")
    private Session session;

    @OnWebSocketClose
    public void onClose(int statusCode, String reason) {
        System.out.println("Close: statusCode=" + statusCode + ", reason=" + reason);
        try {
            Thread.sleep(60000);
            this.initialize();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @OnWebSocketError
    public void onError(Throwable t) {
        session.close();
        onClose(401, "");
    }

    @OnWebSocketConnect
    public void onConnect(Session session) {
        System.out.println("Connected");
    }

    @OnWebSocketMessage
    public void onMessage(String message) {
        data = message;
    }


}
