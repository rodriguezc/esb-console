
package config;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for ActiveMQType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="ActiveMQType">
 *   &lt;complexContent>
 *     &lt;extension base="{http://www.vd.ch/esb}JmxServerType">
 *       &lt;sequence>
 *         &lt;element name="jmsUrl" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="jmsUser" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="jmsPassword" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *       &lt;/sequence>
 *     &lt;/extension>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "ActiveMQType", namespace = "http://www.vd.ch/esb", propOrder = {
    "jmsUrl",
    "jmsUser",
    "jmsPassword"
})
public class ActiveMQType
    extends JmxServerType
{

    @XmlElement(required = true)
    protected String jmsUrl;
    @XmlElement(required = true)
    protected String jmsUser;
    @XmlElement(required = true)
    protected String jmsPassword;

    /**
     * Gets the value of the jmsUrl property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getJmsUrl() {
        return jmsUrl;
    }

    /**
     * Sets the value of the jmsUrl property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setJmsUrl(String value) {
        this.jmsUrl = value;
    }

    /**
     * Gets the value of the jmsUser property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getJmsUser() {
        return jmsUser;
    }

    /**
     * Sets the value of the jmsUser property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setJmsUser(String value) {
        this.jmsUser = value;
    }

    /**
     * Gets the value of the jmsPassword property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getJmsPassword() {
        return jmsPassword;
    }

    /**
     * Sets the value of the jmsPassword property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setJmsPassword(String value) {
        this.jmsPassword = value;
    }

}
