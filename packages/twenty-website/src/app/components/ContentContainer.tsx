'use client'

export const ContentContainer = ({children}: {children?: React.ReactNode}) => {
  return (
      <div style={{
        width: '600px',
        display: 'flex',
        flexDirection: 'column',
      }}>{children}</div>
  )
}