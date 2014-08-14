package security;

import config.RightType;

public class SecurityRWChecker extends SecurityChecker {

    @Override
    boolean validate(RightType right) {
        return RightType.RW.equals(right);
    }
}
