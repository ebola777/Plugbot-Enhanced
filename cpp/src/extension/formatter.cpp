#include "formatter.hpp"

namespace plugbot {
    //--- Constructor ---
    formatter::formatter(std::fstream &stream,
                        int maxWidth,
                        const char *seperator,
                        const char *newline):
        _stream(&stream),
        _maxWidth(maxWidth),
        _seperator(seperator),
        _newline(newline) {}

    //--- Operators ---
    formatter &operator<<(formatter &fmt, const char *str) {
        // for each character in text
        for (const char *c = &str[0]; *c != '\0'; ++c) {
            // for each char in seperator string
            for (const char *cs = &fmt._seperator[0]; *cs != '\0'; ++cs) {
                // check to output buffer to newline
                if (*cs == *c) {
                    if (fmt._currentWidth + fmt._buf.size() > fmt._maxWidth) {
                        // not enough space for current line
                        string::const_iterator bufBegin = fmt._buf.begin(),
                                                bufEnd = fmt._buf.end();

                        // append seperator char at back if there is enough
                        // space
                        while (fmt._currentWidth + 1 <= fmt._maxWidth) {
                            // enough space for seperator char
                            if ( fmt.isSeperator(*bufBegin)) {
                                *(fmt._stream) << *bufBegin;
                                ++bufBegin;
                                ++fmt._currentWidth;
                            } else {
                                break;
                            }
                        }

                        *(fmt._stream) << fmt._newline;

                        // output
                        fmt._currentWidth = std::distance(bufBegin, bufEnd);
                        while (bufBegin != bufEnd) {
                            *(fmt._stream) << *bufBegin;
                            ++bufBegin;
                        }
                    } else {
                        // enough space
                        *(fmt._stream) << fmt._buf;
                        fmt._currentWidth += fmt._buf.size();
                    }

                    // reset buffer string
                    fmt._buf = "";
                }
            }

            // append char to buffer string
            fmt._buf += *c;
        }

        return fmt;
    }

    formatter &operator<<(formatter &fmt, const string &str) {
        fmt << str.c_str();
        return fmt;
    }

    //--- Public Functions ---
    void formatter::close() {
        *_stream << _buf;
        _buf = "";
    }

    //--- Private Functions ---
    bool formatter::isSeperator(const char &cIn) {
        for (const char *cs = &_seperator[0]; *cs != '\0'; ++cs) {
            if (*cs == cIn) { return true; }
        }
        return false;
    }
}
