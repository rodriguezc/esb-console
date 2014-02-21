
package config;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for JmxServerType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="JmxServerType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="jmxUrl" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="jmxUser" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="jmxPassword" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *       &lt;/sequence>
 *       &lt;attribute name="node" type="{http://www.w3.org/2001/XMLSchema}string" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "JmxServerType", namespace = "http://www.vd.ch/esb", propOrder = {
    "jmxUrl",
    "jmxUser",
    "jmxPassword"
})
@XmlSeeAlso({
    ServiceMixType.class,
    ActiveMQType.class
})
public class JmxServerType {

    @XmlElement(required = true)
    protected String jmxUrl;
    @XmlElement(required = true)
    protected String jmxUser;
    @XmlElement(required = true)
    protected String jmxPassword;
    @XmlAttribute(name = "node")
    protected String node;

    /**
     * Gets the value of the jmxUrl property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getJmxUrl() {
        return jmxUrl;
    }

    /**
     * Sets the value of the jmxUrl property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setJmxUrl(String value) {
        this.jmxUrl = value;
    }

    /**
     * Gets the value of the jmxUser property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getJmxUser() {
        return jmxUser;
    }

    /**
     * Sets the value of the jmxUser property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setJmxUser(String value) {
        this.jmxUser = value;
    }

    /**
     * Gets the value of the jmxPassword property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getJmxPassword() {
        return jmxPassword;
    }

    /**
     * Sets the value of the jmxPassword property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setJmxPassword(String value) {
        this.jmxPassword = value;
    }

    /**
     * Gets the value of the node property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNode() {
        return node;
    }

    /**
     * Sets the value of the node property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNode(String value) {
        this.node = value;
    }

}
