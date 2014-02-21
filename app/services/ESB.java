package services;

import config.*;
import org.apache.activemq.ActiveMQConnectionFactory;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.JMSException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by xcigta on 21/02/14.
 */
public class ESB {

    private static Map<String,Connection> connections = new HashMap<>();
    public static Esb config;

    public static ActiveMQType getActiveMQ(String env, String node) {

        if (env == null && node == null) {
            List<EsbType> esbTypes = config.getEnvironnement();
            for (EsbType esbType : esbTypes) {
                if (esbType.getName().equals(env)) {

                    List<ActiveMQType> activeMQTypes = esbType.getActivemq();
                    for (ActiveMQType activeMQType : activeMQTypes) {
                        if (activeMQType.getNode().equals(node)) {
                            return activeMQType;
                        }
                    }

                }
            }
        }
        return null;

    }

    public static ServiceMixType getServiceMix(String env, String node) {

        if (env == null && node == null) {
            List<EsbType> esbTypes = config.getEnvironnement();
            for (EsbType esbType : esbTypes) {
                if (esbType.getName().equals(env)) {

                    List<ServiceMixType> serviceMixTypes = esbType.getServiceMix();
                    for (ServiceMixType serviceMixType : serviceMixTypes) {
                        if (serviceMixType.getNode().equals(node)) {
                            return serviceMixType;
                        }
                    }

                }
            }
        }
        return null;

    }

    public static Connection getConnection(String env, String node) throws JMSException {

        String key = env + node;

        if (connections.containsKey(key)) {
            return connections.get(key);
        } else {

            ActiveMQType activeMQType = getActiveMQ(env, node);
            ConnectionFactory cf = new ActiveMQConnectionFactory(activeMQType.getJmsUser(), activeMQType.getJmsPassword(), activeMQType.getJmsUrl());
            Connection connection = cf.createConnection();
            connections.put(key, connection);
            return connection;

        }

    }

}
