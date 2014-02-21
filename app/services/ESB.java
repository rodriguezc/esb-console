package services;

import config.*;
import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.commons.lang3.StringUtils;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.JMSException;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import java.io.IOError;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by xcigta on 21/02/14.
 */
public class ESB {

    private static Map<String, JMXConnector> jmxConnectors = new HashMap<>();
    private static Map<String,Connection> connections = new HashMap<>();
    public static Esb config;

    public static ActiveMQType getActiveMQ(String env, String node) {

        if (env != null && node != null) {
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

    public static ActiveMQType getActiveMQByLabel(String env, String node) {

        if (env != null && node != null) {
            List<EsbType> esbTypes = config.getEnvironnement();
            for (EsbType esbType : esbTypes) {
                if (esbType.getLabel().equals(env)) {

                    List<ActiveMQType> activeMQTypes = esbType.getActivemq();
                    for (ActiveMQType activeMQType : activeMQTypes) {
                        if (activeMQType.getNode().equals(StringUtils.right(node,1))) {
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

    public static Connection getConnection(ActiveMQType activemq) throws JMSException {

        String key = activemq.getJmsUrl();

        if (!connections.containsKey(key)) {

            ConnectionFactory cf = new ActiveMQConnectionFactory(activemq.getJmsUser(), activemq.getJmsPassword(), activemq.getJmsUrl());
            Connection connection = cf.createConnection();
            connections.put(key, connection);

        }

        return connections.get(key);

    }

    public static JMXConnector getJmxConnector(JmxServerType jmxServer) throws MalformedURLException, IOException {

        String key = jmxServer.getJmxUrl();

        if (!jmxConnectors.containsKey(key)) {

            JMXConnector connector = null;
            Map<String, String[]> env = new HashMap<String, String[]>();
            String[] creds = {jmxServer.getJmxUser(), jmxServer.getJmxPassword()};
            env.put(JMXConnector.CREDENTIALS, creds);
            connector = JMXConnectorFactory.connect(new JMXServiceURL(jmxServer.getJmxUrl()), env);
            jmxConnectors.put(key, connector);

        }

        return jmxConnectors.get(key);

    }


}
