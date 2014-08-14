package services;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import config.ServiceMixType;
import org.apache.commons.lang3.StringUtils;
import play.Logger;
import play.libs.Json;
import java.util.List;

import javax.management.*;
import javax.management.openmbean.CompositeData;
import javax.management.openmbean.TabularData;
import javax.management.remote.JMXConnector;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
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


    public static  List<ObjectName> getBundleCamelContexts(ServiceMixType serviceMix, String bundleId) throws MalformedObjectNameException, IOException {


        JMXConnector connector = ESB.getJmxConnector(serviceMix);
        MBeanServerConnection connection = connector.getMBeanServerConnection();

        Set<ObjectName> contexts = connection.queryNames(new ObjectName("org.apache.camel:context=*,type=context,name=*"), null);

        List<ObjectName> bundleContexts = new ArrayList<ObjectName>();
        for (ObjectName context : contexts) {
            Logger.info(context.getCanonicalName());

            String curBundleId = StringUtils.substringBetween(context.getKeyProperty("context"), "/", "-");
            if(curBundleId.equals(bundleId)) {
                bundleContexts.add(context);
            }
        }



        return bundleContexts;

    }


    public static  List<ObjectName> getBundleRoutes(ServiceMixType serviceMix, String bundleId) throws MalformedObjectNameException, IOException {


        JMXConnector connector = ESB.getJmxConnector(serviceMix);
        MBeanServerConnection connection = connector.getMBeanServerConnection();

        Set<ObjectName> routes = connection.queryNames(new ObjectName("org.apache.camel:context=*,type=routes,name=*"), null);

        List<ObjectName> bundleRoutes = new ArrayList<ObjectName>();
        for (ObjectName route : routes) {
            Logger.info(route.getCanonicalName());

            String curBundleId = StringUtils.substringBetween(route.getKeyProperty("context"), "/", "-");
            if(curBundleId.equals(bundleId)) {
                bundleRoutes.add(route);
            }
        }



        return bundleRoutes;

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


    public static ObjectNode getBundleDetails(ServiceMixType serviceMix, String bundleId) throws IOException, MalformedObjectNameException {
        JMXConnector connector = ESB.getJmxConnector(serviceMix);
        MBeanServerConnection connection = connector.getMBeanServerConnection();


        ObjectNode result = Json.newObject();


        List<ObjectName> routes = getBundleRoutes(serviceMix, bundleId);
        ArrayNode routesRes = result.putArray("routes");

        for(ObjectName route : routes) {
            String name = route.getKeyProperty("name").replaceAll("\"", "");
            String xml = null;
            try {
                xml = (String)connection.invoke(route, "dumpRouteAsXml", null, null);
            } catch (Exception e) {
                xml = "<error>CANNOT DUMP ROUTE</error>";
            }
            routesRes.addObject().put("name",name).put("xml", xml);
        }

        return result;
    }
}
