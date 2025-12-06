PREFIX ?= /usr/local

SOURCES = $(wildcard bin/*)

.PHONY: all
all: install

.PHONY: install
install: $(SOURCES)
	@mkdir -p $(DESTDIR)$(PREFIX)/bin
	@for file in $(SOURCES); do \
		echo "Installing $(DESTDIR)$(PREFIX)/$$file"; \
		install -Dm755 $$file $(DESTDIR)$(PREFIX)/$$file; \
	done

.PHONY: uninstall
uninstall:
	@for file in $(SOURCES); do \
		echo "Removing $(DESTDIR)$(PREFIX)/$$file"; \
		$(RM) $(DESTDIR)$(PREFIX)/$$file; \
	done
