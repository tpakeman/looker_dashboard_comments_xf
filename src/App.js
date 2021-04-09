import React, { useContext }  from "react"
import { hot } from "react-hot-loader/root"
import { ExtensionProvider } from "@looker/extension-sdk-react"
import { ComponentsProvider, Box, Flex } from '@looker/components'
import { MainPage } from './Comments/MainPage'

const AppInternal = (props) => {
        return (
            <Flex height='100vh' width='100vw'>
                <MainPage/>
            </Flex>
    )
}

const AppContextWrapper = () => {
    return (
        <ExtensionProvider >
            <ComponentsProvider>
                <AppInternal/>
            </ComponentsProvider>
        </ExtensionProvider>
    )
};

export const App = hot(AppContextWrapper)

