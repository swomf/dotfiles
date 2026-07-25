#include <gtk/gtk.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static gboolean render_icon(const char *name, int size, const char *color,
                            const char *path, GError **error) {
  GdkRGBA rgba;
  // gsettings get org.gnome.desktop.interface gtk-theme
  // ~/.themes/Blackbriar-Dark/gtk-3.0/gtk.css
  // swomf/Blackbriar-theme
  GdkRGBA success;
  GdkRGBA warning;
  GdkRGBA error_color;

  if (size <= 0) {
    // dont panic cuz because that would be useless
    g_set_error_literal(error, G_FILE_ERROR, G_FILE_ERROR_INVAL,
                        "invalid icon size");
    return FALSE;
  }

  if (!gdk_rgba_parse(&rgba, color)) {
    g_set_error(error, G_FILE_ERROR, G_FILE_ERROR_INVAL, "invalid color: %s",
                color);
    return FALSE;
  }

  success = warning = error_color = rgba;

  /*
   * symbolic icon SVGs can mark paths as success, warning, or error
   * lookup gtk theme but retain caller color for ordainry foreground paths
   */
  GtkWidget *image = gtk_image_new();
  g_object_ref_sink(image);
  GtkStyleContext *context = gtk_widget_get_style_context(image);
  gtk_style_context_lookup_color(context, "success_color", &success);
  gtk_style_context_lookup_color(context, "warning_color", &warning);
  gtk_style_context_lookup_color(context, "error_color", &error_color);
  g_object_unref(image);

  // recoloration of symbolics
  GtkIconInfo *info = gtk_icon_theme_lookup_icon(
      gtk_icon_theme_get_default(), name, size,
      GTK_ICON_LOOKUP_FORCE_SIZE | GTK_ICON_LOOKUP_FORCE_SYMBOLIC);

  if (!info) {
    g_set_error(error, G_FILE_ERROR, G_FILE_ERROR_NOENT, "icon not found: %s",
                name);
    return FALSE;
  }

  GdkPixbuf *pixbuf = gtk_icon_info_load_symbolic(
      info, &rgba, &success, &warning, &error_color, NULL, error);

  if (!pixbuf) {
    g_clear_error(error);
    pixbuf = gtk_icon_info_load_icon(info, error);
  }

  g_object_unref(info);

  if (!pixbuf)
    return FALSE;

  gboolean ok = gdk_pixbuf_save(pixbuf, path, "png", error, NULL);
  g_object_unref(pixbuf);
  return ok;
}

// i wanted to name something
// demon at least once in my life.
static int demon(void) {
  char *line = NULL;
  size_t capacity = 0;

  while (getline(&line, &capacity, stdin) >= 0) {
    line[strcspn(line, "\r\n")] = '\0';

    char **field = g_strsplit(line, "\t", 5);
    GError *error = NULL;
    char *name = NULL;
    char *color = NULL;
    char *path = NULL;

    gboolean ok = g_strv_length(field) == 5;
    if (ok) {
      // from qml passing stuff like %23e0e0e0
      name = g_uri_unescape_string(field[1], NULL);
      color = g_uri_unescape_string(field[3], NULL);
      path = g_uri_unescape_string(field[4], NULL);
      ok = name && color && path;
    }

    if (ok)
      ok = render_icon(name, atoi(field[2]), color, path, &error);

    if (!ok && !error)
      g_set_error_literal(&error, G_FILE_ERROR, G_FILE_ERROR_INVAL,
                          "invalid encoded request");

    printf(ok ? "ok\t%s\n" : "error\t%s\t%s\n", field[0],
           error ? error->message : "invalid request");
    fflush(stdout);

    g_clear_error(&error);
    g_free(path);
    g_free(color);
    g_free(name);
    g_strfreev(field);
  }

  free(line);
  return EXIT_SUCCESS;
}

int main(int argc, char **argv) {
  if (!gtk_init_check(NULL, NULL)) {
    fputs("could not initialize GTK\n", stderr);
    return EXIT_FAILURE;
  }

  if (argc == 2 && !strcmp(argv[1], "--worker"))
    return demon();

  if (argc != 5) {
    fprintf(stderr, "usage: %s ICON SIZE COLOR OUTPUT\n", argv[0]);
    return EXIT_FAILURE;
  }

  GError *error = NULL;
  gboolean ok = render_icon(argv[1], atoi(argv[2]), argv[3], argv[4], &error);

  if (!ok) {
    fprintf(stderr, "%s\n", error ? error->message : "render failed");
    g_clear_error(&error);
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}
