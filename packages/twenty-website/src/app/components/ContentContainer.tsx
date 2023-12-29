'use client'

import styled from '@emotion/styled'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 600px;
     @media(max-width: 809px) {
        width: 100%;
    }`;


export const ContentContainer = ({children}: {children?: React.ReactNode}) => {
  return (
      <Container>{children}</Container>
  )
}