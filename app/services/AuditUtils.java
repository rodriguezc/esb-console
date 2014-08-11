package services;

import com.fasterxml.jackson.databind.node.ObjectNode;
import play.libs.Json;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Created by xcigta on 25/02/14.
 */
public class AuditUtils {

    public static ObjectNode getAuditByMessageId(DataSource ds, String messageId) throws SQLException {

        Connection c = null;
        PreparedStatement pstm = null;
        ResultSet rs = null;

        try {

            c = ds.getConnection();
            c.setReadOnly(true);

            pstm = c.prepareStatement("select * from message where message_id=?");
            pstm.setString(1,messageId);

            rs = pstm.executeQuery();
            if (rs.next()) {

                ObjectNode node = Json.newObject();
                ObjectNode message = node.putObject("message");
                mapRow(message, rs);
                return node;

            } else {

                return null;

            }

        } finally {
            if (rs != null) {
                rs.close();
            }

            if (pstm != null) {
                pstm.close();
            }

            if (c != null) {
                c.close();
            }
        }

    }

    private static void mapRow(ObjectNode node, ResultSet row) throws SQLException {

        node.put("messageId", row.getString("message_id"));


    }

}
