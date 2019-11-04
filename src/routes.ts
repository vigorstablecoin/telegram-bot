import { UserController } from "./controller/UserController";
import InfoController from "./controller/InfoController";

export const Routes = [{
        method: "get",
        route: "/users",
        controller: UserController,
        action: "all"
    }, {
        method: "get",
        route: "/info",
        controller: InfoController,
        action: "version"
    },
];