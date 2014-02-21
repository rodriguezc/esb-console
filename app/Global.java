import config.Esb;
import play.Configuration;
import play.GlobalSettings;
import services.ESB;

import javax.xml.bind.JAXB;
import java.io.File;

/**
 * Created by xcigta on 21/02/14.
 */
public class Global extends GlobalSettings {


    @Override
    public Configuration onLoadConfig(Configuration configuration, File file, ClassLoader classLoader) {

        String esbConfig = configuration.getString("esb.config");
        ESB.config = JAXB.unmarshal(new File(file, esbConfig), Esb.class);

        return configuration;
    }



}
