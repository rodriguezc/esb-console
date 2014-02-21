
package config;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for esbType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="esbType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="activemq" type="{http://www.vd.ch/esb}ActiveMQType" maxOccurs="unbounded"/>
 *         &lt;element name="serviceMix" type="{http://www.vd.ch/esb}ServiceMixType" maxOccurs="unbounded"/>
 *         &lt;element name="auditDataSource" type="{http://www.vd.ch/esb}dataSourceType"/>
 *         &lt;element name="cmptDataSource" type="{http://www.vd.ch/esb}dataSourceType"/>
 *         &lt;element name="raft" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *       &lt;/sequence>
 *       &lt;attribute name="name" type="{http://www.w3.org/2001/XMLSchema}string" />
 *       &lt;attribute name="label" type="{http://www.w3.org/2001/XMLSchema}string" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "esbType", namespace = "http://www.vd.ch/esb", propOrder = {
    "activemq",
    "serviceMix",
    "auditDataSource",
    "cmptDataSource",
    "raft"
})
public class EsbType {

    @XmlElement(required = true)
    protected List<ActiveMQType> activemq;
    @XmlElement(required = true)
    protected List<ServiceMixType> serviceMix;
    @XmlElement(required = true)
    protected DataSourceType auditDataSource;
    @XmlElement(required = true)
    protected DataSourceType cmptDataSource;
    @XmlElement(required = true)
    protected String raft;
    @XmlAttribute(name = "name")
    protected String name;
    @XmlAttribute(name = "label")
    protected String label;

    /**
     * Gets the value of the activemq property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the activemq property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getActivemq().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link ActiveMQType }
     * 
     * 
     */
    public List<ActiveMQType> getActivemq() {
        if (activemq == null) {
            activemq = new ArrayList<ActiveMQType>();
        }
        return this.activemq;
    }

    /**
     * Gets the value of the serviceMix property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the serviceMix property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getServiceMix().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link ServiceMixType }
     * 
     * 
     */
    public List<ServiceMixType> getServiceMix() {
        if (serviceMix == null) {
            serviceMix = new ArrayList<ServiceMixType>();
        }
        return this.serviceMix;
    }

    /**
     * Gets the value of the auditDataSource property.
     * 
     * @return
     *     possible object is
     *     {@link DataSourceType }
     *     
     */
    public DataSourceType getAuditDataSource() {
        return auditDataSource;
    }

    /**
     * Sets the value of the auditDataSource property.
     * 
     * @param value
     *     allowed object is
     *     {@link DataSourceType }
     *     
     */
    public void setAuditDataSource(DataSourceType value) {
        this.auditDataSource = value;
    }

    /**
     * Gets the value of the cmptDataSource property.
     * 
     * @return
     *     possible object is
     *     {@link DataSourceType }
     *     
     */
    public DataSourceType getCmptDataSource() {
        return cmptDataSource;
    }

    /**
     * Sets the value of the cmptDataSource property.
     * 
     * @param value
     *     allowed object is
     *     {@link DataSourceType }
     *     
     */
    public void setCmptDataSource(DataSourceType value) {
        this.cmptDataSource = value;
    }

    /**
     * Gets the value of the raft property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRaft() {
        return raft;
    }

    /**
     * Sets the value of the raft property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRaft(String value) {
        this.raft = value;
    }

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the label property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLabel() {
        return label;
    }

    /**
     * Sets the value of the label property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLabel(String value) {
        this.label = value;
    }

}
