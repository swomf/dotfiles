PROG := render-gtk-icon
PKG_CONFIG ?= pkg-config

CPPFLAGS += $(shell $(PKG_CONFIG) --cflags gtk+-3.0)
CFLAGS ?= -O2
CFLAGS += -Wall -Wextra -Wpedantic
LDLIBS += $(shell $(PKG_CONFIG) --libs gtk+-3.0)

.PHONY: all clean

all: $(PROG)

clean:
	$(RM) $(PROG)
