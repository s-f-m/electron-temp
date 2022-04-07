!macro preInit
    SetRegView 64
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "<=%address%>"
    WriteRegExpandStr HkCU "${INSTALL_REGISTRY_KEY}" InstallLocation "<=%address%>"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "<=%address%>"
    WriteRegExpandStr HkCU "${INSTALL_REGISTRY_KEY}" InstallLocation "<=%address%>"
!macroend