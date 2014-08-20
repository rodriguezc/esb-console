package security;

import config.RightType;

public class SecurityROChecker extends SecurityChecker {


    @Override
    boolean validate(RightType right) {
        return RightType.RO.equals(right) || RightType.RW.equals(right) ;
    }
}
