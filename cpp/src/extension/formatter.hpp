#ifndef _EXTENSION_FORMATTER_H_
#define _EXTENSION_FORMATTER_H_

#include <iostream>
#include <cstring>
#include <fstream>
#include <iterator>

namespace plugbot {
    using std::string;

    class formatter {
    public:
        //--- Constructors ---
        formatter(std::fstream &stream, int , const char *, const char *);
        //--- Operators ---
        friend formatter &operator<<(formatter &, const char *);
        friend formatter &operator<<(formatter &, const string &);
        //--- Public Functions ---
        void close();

    private:
        //--- Private Functions ---
        bool isSeperator(const char &);

        //--- Properties ---
        std::fstream *_stream;
        size_t _maxWidth;
        const char *_seperator;
        const char *_newline;

        //--- Variables ---
        size_t _currentWidth = 0;
        string _buf;
    };
}

#endif
