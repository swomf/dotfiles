CC = gcc
CFLAGS = -Os -flto -ffunction-sections -fdata-sections
LDFLAGS = -flto

all: lockstatus

lockstatus: lockstatus.c
	$(CC) lockstatus.c -o lockstatus $(CFLAGS)