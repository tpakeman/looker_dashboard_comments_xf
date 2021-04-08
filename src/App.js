import React, { useContext }  from "react"
import { hot } from "react-hot-loader/root"
import { ExtensionProvider, ExtensionContext } from "@looker/extension-sdk-react"
import { lookerCaller } from './utils'
import { ComponentsProvider, Box, Flex } from '@looker/components'

const AppInternal = (props) => {
    const extensionContext = useContext(ExtensionContext);
    const lookerRequest = lookerCaller(extensionContext.core40SDK);
        return (
        <Box>
            <Flex height='100vh'>
                <div>Hello</div>
            </Flex>
        </Box>
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

