return {
  {
    "folke/noice.nvim",
    require("noice").setup({
      routes = {
        {
          filter = {
            event = "lsp",
            kind = "progress",
            find = "jdtls", -- make jdtls Validate Documents shut up
            -- https://github.com/LazyVim/LazyVim/discussions/1439
          },
          opts = { skip = true },
        },
      },
    }),
  },
}
