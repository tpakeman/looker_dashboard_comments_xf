import React from 'react'
import styled from "styled-components"
import { Flex, Spinner} from '@looker/components'

export const EmbedContainer = styled.div`
  width: 100%;
  height: 60%;
  & > iframe {
    width: 100%;
    height: 100%;
  }
`

export const LoadingComponent = (props) => {
  return (
    <Flex width='100%' alignItems='center' justifyContent='center'>
      <Spinner color='black' />
    </Flex>
  )
}