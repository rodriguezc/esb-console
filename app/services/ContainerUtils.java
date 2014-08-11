package services;

import com.fasterxml.jackson.databind.node.ArrayNode;
import config.ServiceMixType;
import org.apache.commons.lang3.StringUtils;
import play.Logger;
import play.libs.Json;

import javax.management.MBeanServerConnection;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.openmbean.CompositeData;
import javax.management.openmbean.TabularData;
import javax.management.remote.JMXConnector;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.Set;

/**
 * Created by xcigta on 25/02/14.
 */
public class ContainerUtils {

   // org.apache.camel:context=slv0902v/200-iam-context,type=context,name="iam-context"

    public static ArrayNode getCamelContexts(ServiceMixType serviceMix) throws MalformedObjectNameException, IOException {

        ArrayNode list = Json.newObject().arrayNode();

        JMXConnector connector = ESB.getJmxConnector(serviceMix);
        MBeanServerConnection connection = connector.getMBeanServerConnection();

        Set<ObjectName> contexts = connection.queryNames(new ObjectName("org.apache.camel:context=*,type=context,name=*"), null);
        for (ObjectName context : contexts) {
            Logger.info(context.getCanonicalName());

            long bundleId = Long.parseLong(StringUtils.substringBetween(context.getKeyProperty("context"), "/", "-"));
            String name = StringUtils.strip(context.getKeyProperty("name"), "\"");

            list.addObject().put("bundle", bundleId).put("name", name);
        }



        return list;

    }

    public static ArrayNode getBundles(ServiceMixType serviceMix) throws Exception {

        ArrayNode list = Json.newObject().arrayNode();

        JMXConnector connector = ESB.getJmxConnector(serviceMix);
        MBeanServerConnection connection = connector.getMBeanServerConnection();

        ObjectName bundleState = new ObjectName("osgi.core:type=bundleState,version=1.5");
        TabularData result = (TabularData) connection.invoke(bundleState, "listBundles", new Object[] {}, new String[] {});
        Collection<CompositeData> datas = (Collection<CompositeData>) result.values();
        for (CompositeData data : datas) {

            String symbolicName = (String) data.get("SymbolicName");

          //  if (symbolicName.startsWith("ch.vd.esb")) {

                // String name = (String) data.get("Name");
                Long lastModification = (Long) data.get("LastModified");

                Long identifier = (Long) data.get("Identifier");
                String version = (String) data.get("Version");
                String state = (String) data.get("State");

                list.addObject().
                        put("id", identifier).
                        put("name", symbolicName).
                        put("symbolicName", symbolicName).
                        put("version", version).
                        put("serverName", serviceMix.getNode()).
                        put("bundleId", identifier).
                        put("state", state).
                        put("lastModification", new SimpleDateFormat("yyyy.MM.dd HH:mm:ss.SSS").format(new Date(lastModification)));

           // }
        }
        return list;

    }


}
