import { UserController } from "./controller/UserController";
import InfoController from "./controller/InfoController";
import HealthController from "./controller/HealthController";

export const Routes = [
    {
        method: "get",
        route: "/users",
        controller: UserController,
        action: "all"
    },
    {
        method: "get",
        route: "/info",
        controller: InfoController,
        action: "version"
    },
    {
        method: "get",
        route: "/health",
        controller: HealthController,
        action: "version"
    },
];