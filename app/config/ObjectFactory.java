
package config;

import javax.xml.bind.annotation.XmlRegistry;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the config package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {


    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: config
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link Esb }
     * 
     */
    public Esb createEsb() {
        return new Esb();
    }

    /**
     * Create an instance of {@link EsbType }
     * 
     */
    public EsbType createEsbType() {
        return new EsbType();
    }

    /**
     * Create an instance of {@link ServiceMixType }
     * 
     */
    public ServiceMixType createServiceMixType() {
        return new ServiceMixType();
    }

    /**
     * Create an instance of {@link ActiveMQType }
     * 
     */
    public ActiveMQType createActiveMQType() {
        return new ActiveMQType();
    }

    /**
     * Create an instance of {@link RoleType }
     * 
     */
    public RoleType createRoleType() {
        return new RoleType();
    }

    /**
     * Create an instance of {@link DataSourceType }
     * 
     */
    public DataSourceType createDataSourceType() {
        return new DataSourceType();
    }

    /**
     * Create an instance of {@link JmxServerType }
     * 
     */
    public JmxServerType createJmxServerType() {
        return new JmxServerType();
    }

}
