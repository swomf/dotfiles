vim.opt.list = false
return {
  {
    "EdenEast/nightfox.nvim",
    opts = {
      palettes = {
        carbonfox = {
          bg1 = "#000000", -- Black background
          bg0 = "#090909", -- Alt backgrounds (floats, statusline, ...)
          bg3 = "#121820", -- 55% darkened from stock
          sel0 = "#131b24", -- 55% darkened from stock
        },
      },
    },
  },
  {
    "LazyVim/LazyVim",
    opts = {
      colorscheme = "carbonfox",
    },
  },
}
