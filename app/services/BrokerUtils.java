package services;

import javax.management.MBeanServerConnection;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import java.io.IOException;
import java.util.Set;

/**
 * Created by xcigta on 21/02/14.
 */
public class BrokerUtils {

    protected static String BROKER_OBJECT_NAME = "org.apache.activemq:BrokerName=*,Type=Broker";
    protected static String BROKER_OBJECT_NAME_JBOSS = "org.apache.activemq:type=Broker,brokerName=*";

    public static Set<ObjectName> getBrokers(MBeanServerConnection server) throws MalformedObjectNameException, IOException {

        ObjectName brokerObjectName = new ObjectName(BROKER_OBJECT_NAME);
        Set<ObjectName> brokers = server.queryNames(brokerObjectName, null);

        if (brokers.size() == 0) {
            brokerObjectName = new ObjectName(BROKER_OBJECT_NAME_JBOSS);
            brokers = server.queryNames(brokerObjectName, null);
        }

        return brokers;
    }

    public static ObjectName getDefaultBroker(MBeanServerConnection server) throws MalformedObjectNameException, IOException {
        return getBrokers(server).iterator().next();
    }


}


