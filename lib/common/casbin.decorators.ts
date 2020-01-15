import {Inject} from "@nestjs/common";
import {CASBIN_ADAPTER, CASBIN_ENFORCER} from "../casbin.constants";

/**
 * Used to inject the Enforcer in your services... It is very simple
 */
export const InjectEnforcer = () => Inject(CASBIN_ENFORCER);
export const InjectAdapter = () => Inject(CASBIN_ADAPTER);

