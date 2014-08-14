
package config;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for RightType.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="RightType">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="RO"/>
 *     &lt;enumeration value="RW"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "RightType", namespace = "http://www.vd.ch/esb")
@XmlEnum
public enum RightType {

    RO,
    RW;

    public String value() {
        return name();
    }

    public static RightType fromValue(String v) {
        return valueOf(v);
    }

}
