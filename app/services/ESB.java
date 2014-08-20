package services;

import com.mongodb.MongoClient;
import config.*;
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.JMSException;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import javax.sql.DataSource;
import java.io.IOException;
import java.net.MalformedURLException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by xcigta on 21/02/14.
 */
public class ESB {

    private static Map<String, JMXConnector> jmxConnectors = new HashMap<>();
    private static Map<String,Connection> connections = new HashMap<>();
    private static Map<String, MongoClient> dataSources = new HashMap<>();
    public static Esb config;

    public static List<ActiveMQType> getBrokers(String env) {

        if (env != null) {
            List<EsbType> esbTypes = config.getEnvironnement();
            for (EsbType esbType : esbTypes) {
                if (esbType.getName().equals(env)) {

                    return esbType.getActivemq();

                }
            }
        }

        return null;
    }

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

    public static List<ServiceMixType> getServiceMix(String env) {
        List<EsbType> esbTypes = config.getEnvironnement();
        for (EsbType esbType : esbTypes) {
            if (esbType.getName().equals(env)) {
                return esbType.getServiceMix();
            }
        }
        return new ArrayList<ServiceMixType>();

    }
    public static List<RoleType> getRoles(String env) {
        List<EsbType> esbTypes = config.getEnvironnement();
        for (EsbType esbType : esbTypes) {
            if (esbType.getName().equals(env)) {
                return esbType.getRole();
            }
        }
        return new ArrayList<RoleType>();
    }





    public static ServiceMixType getServiceMix(String env, String node) {

        if (env != null && node != null) {
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
            connection.start();
            connections.put(key, connection);

        }

        return connections.get(key);

    }

    public static MongoClient getDataSource(String env) throws Exception {

        if (!dataSources.containsKey(env)) {

            List<EsbType> esbTypes = ESB.config.getEnvironnement();
            for (EsbType esbType : esbTypes) {
                if (esbType.getName().equals(env)) {

                    MongoClient mongoClient = new MongoClient(esbType.getAuditDataSource().getUrl());
                    dataSources.put(env, mongoClient);
                    break;
                }
            }

        }

        return dataSources.get(env);

    }

    public static String getAuditDatabase(String env) throws Exception {

        String database = null;

        List<EsbType> esbTypes = ESB.config.getEnvironnement();
        for (EsbType esbType : esbTypes) {
            if (esbType.getName().equals(env)) {
                database = esbType.getAuditDataSource().getDatabase();
                break;
            }
        }

        return database;
    }

    public static String getCmptDatabase(String env) throws Exception {

        String database = null;

        List<EsbType> esbTypes = ESB.config.getEnvironnement();
        for (EsbType esbType : esbTypes) {
            if (esbType.getName().equals(env)) {
                database = esbType.getCmptDataSource().getDatabase();
                break;
            }
        }

        return database;
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
