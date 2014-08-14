package security;

import config.RightType;
import config.RoleType;
import org.springframework.util.Assert;
import play.libs.F;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Security;
import play.mvc.SimpleResult;
import services.ESB;

import java.util.ArrayList;
import java.util.List;

public abstract class SecurityChecker extends Action<Security.Authenticated> {


    abstract boolean validate(RightType right);


    @Override
    public F.Promise<SimpleResult> call(Http.Context ctx) throws Throwable {
        String user = null;
        String[] userRoles = null;

        //Get user and roles
        if (ctx.request().headers().containsKey("iam-userid")) {

            user = ctx.request().headers().get("iam-userid")[0];
            String application = ctx.request().headers().get("iam-application")[0];
            String rolesStr = ctx.request().headers().get("iam-roles")[0];

            List<String> roles = parseRoles(application, rolesStr);

            userRoles =roles.toArray(new String[roles.size()]);

        } else {
            user = "Dev user";
            userRoles = new String[]{"ROLE1", "ROLE2"};
        }


        ctx.request().setUsername(user);
        ctx.args.put("userRoles", userRoles);

        //ctx.request().headers().put("userRoles", userRoles);
        if (ctx.request().uri().startsWith("/services/environments/")) {
            String env = ctx.request().uri().split("/")[3];
            List<RoleType> roles = ESB.getRoles(env);

            List<RightType> matchingRight = new ArrayList();

            for(RoleType role : roles) {
                for(String userRole : userRoles) {
                    if(role.getName().equals(userRole)) {
                        matchingRight.add(role.getRight());
                    }
                }
            }
            boolean isAuthorized = false;

             for(RightType right : matchingRight ) {
                 isAuthorized = validate(right);
                 if(isAuthorized) {
                     break;
                 }
            }
            if(!isAuthorized) {
                return F.Promise.pure((SimpleResult) unauthorized("Vous n'avez pas d'autorisation"));
            }
        }
        return delegate.call(ctx);
    }


    @SuppressWarnings({"rawtypes", "unchecked"})
    List<String> parseRoles(String application, String rolesStr) {

        List<String> result = new ArrayList<String>();

        Assert.notNull(application);
        Assert.notNull(rolesStr);


        // Example of roles obtained from IAM:
        // Application: finances-demo
        // Role: cn=finances-demo-comptable,dc=etat-de-vaud,dc=ch
        //  -> Role: ROLE_COMPTABLE
        // cn=finances-demo-secretaire_d_office,dc=etat-de-vaud,dc=ch
        // cn=finances-demo-juriste,dc=etat-de-vaud,dc=ch
        // cn=finances-demo-prepose,dc=etat-de-vaud,dc=ch

        // Split roles with separator "pipe":
        final String[] roles = rolesStr.split("\\x7C");

        for (final String role : roles) {

            if (isLDAPRoles(role)) {
                // Don't take "cn=" nor ",dc=.." by splitting:
                String[] roleItems = role.split("[=,]");
                if (roleItems.length > 1) {
                    String appRole = roleItems[1];

                    // Take only those roles that are relevant to this
                    // application:
                    if (appRole.startsWith(application) && appRole.charAt(application.length()) == '-') {
                        // Extract business role by removing application name:
                        final String subRole = appRole.substring(1 + application.length());
                        result.add(subRole);
                    }
                }

            }
            else {
                // Take only those roles that are relevant to this
                // application:
                if (role.startsWith(application) && role.charAt(application.length()) == '-') {
                    // Extract business role by removing application name:
                    final String subRole = role.substring(1 + application.length());
                    result.add(subRole);
                }
            }
        }

        return result;
    }

    static boolean isLDAPRoles(String allRoles) {
        return allRoles.contains("=");
    }

}
