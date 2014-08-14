
package config;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for RoleType complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="RoleType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="name" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="right" type="{http://www.vd.ch/esb}RightType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "RoleType", namespace = "http://www.vd.ch/esb", propOrder = {
    "name",
    "right"
})
public class RoleType {

    @XmlElement(required = true)
    protected String name;
    @XmlElement(required = true)
    protected RightType right;

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
     * Gets the value of the right property.
     * 
     * @return
     *     possible object is
     *     {@link RightType }
     *     
     */
    public RightType getRight() {
        return right;
    }

    /**
     * Sets the value of the right property.
     * 
     * @param value
     *     allowed object is
     *     {@link RightType }
     *     
     */
    public void setRight(RightType value) {
        this.right = value;
    }

}
