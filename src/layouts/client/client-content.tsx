import type { ContainerProps } from "@mui/material/Container";

import Container from "@mui/material/Container";

export function ClientContent({

    children,

    maxWidth = "lg",

    ...other

}: ContainerProps) {

    return (

        <Container
            maxWidth={maxWidth}
            sx={{
                py: 4,
            }}
            {...other}
        >
            {children}
        </Container>

    );

}