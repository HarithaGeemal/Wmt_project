import { NavigationContainerRef, NavigationState } from "@react-navigation/native";
import React from "react";
import { RootStackParamList } from "./Routes";
import Logger from "utils/Logger";


export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

export function parseAndLogRoute(state:NavigationState | undefined) {
    if (!state) return;

    const {routes,index} = state;
    const currentRoute = routes[index];
    Logger.info("Current Route", {name:currentRoute?.name, params:currentRoute?.params});
    
}


export function setIsNavigationReady(){
    Logger.info("Navigation is ready");
}