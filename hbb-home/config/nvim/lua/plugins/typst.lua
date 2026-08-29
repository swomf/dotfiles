return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        tinymist = {
          settings = {
            formatterMode = "typstyle",
            formatterIndentSize = 2,
            formatterPrintWidth = 100,
            formatterProseWrap = true,
          },
        },
      },
    },
  },
}
