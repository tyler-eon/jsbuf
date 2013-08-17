/**
 * Main JavaScript Protobuf Object.
 * Contains the core encode and decode functions.
 */
var Protobuf = {
    /**
     * Decode a binary string. This means each code point in the string should
     * be a single byte of raw binary data.
     */
    decode: function(str) {
        var fields = [];
        var i = 0, end = str.length;
        var cur, val, typ, num;
        for (;i < end; i++) {
            cur = Protobuf.pop_varint(str, i);
            num = cur[0] >> 3;
            typ = cur[0] - (num << 3);
            val = Protobuf.wire_decode(typ)(str, cur[1] + 1);
            fields.push([num, typ, val[0]]);
            i = val[1];
        }
        return fields;
    },

    /**
     * Returns a variable-sized integer from the payload, starting at the given
     * index.
     */
    pop_varint: function(payload, idx, acc, itr) {
        if (!acc) { acc = 0; }
        if (!itr) { itr = 0; }
        var head = payload.charCodeAt(idx + itr);
        var msb  = head & 128;
        var data = (head & 127) << (itr * 7);
        if (msb == 128)
            return Protobuf.pop_varint(
                    payload,
                    idx,
                    data + acc,
                    itr + 1
                );
        return [data + acc, idx + itr];
    },

    /**
     * Returns the next 4 bytes (32 bits) of data from the payload, starting at
     * the given index.
     */
    pop_32bits: function(payload, idx) {
        var data = 0;
        var i = idx, max = payload.length, end = idx + 4;
        for (; i < max && i < end; i++) {
            var c = payload.charCodeAt(idx);
            data += (c << (end - i - 1));
        }
        return [payload.charCodeAt(idx), i];
    },

    /**
     * Returns the next 8 bytes (64 bits) of data from the payload, starting at
     * the given index.
     */
    pop_64bits: function(payload, idx) {
        var data = 0;
        var i = idx, max = payload.length, end = idx + 8;
        for (; i < max && i < end; i++) {
            var c = payload.charCodeAt(idx);
            data += (c << (end - i - 1));
        }
        return [payload.charCodeAt(idx), i];
    },

    /**
     * Returns a variable-length string from the payload, starting at the given
     * index. The first code point in the payload, at `idx`, should be a
     * `varint` representing the number of bytes in the string.
     */
    pop_string: function(payload, idx) {
        var res = Protobuf.pop_varint(payload, idx);
        var i = res[1] + 1, max = payload.length;
        var data = "";
        for (var end = i + res[0]; i < max && i < end; i++)
            data += payload[i];
        return [data, i];
    },

    /** Returns the Protobuf function responsible for decoding the value of a
     * given wire type.
     *
     * Each function takes in `(payload, index)` as its arguments, where
     * `payload` is the binary string being decoded and `index` is the index
     * within the payload to act as the starting point for the decode operation.
     * 
     * Each function returns `[Value, EndIndex]` where `Value` is the decoded
     * value of a field and `EndIndex` is the last index inside `payload` that
     * was used during the decoding operation.
     */
    wire_decode: function(type) {
        switch (type) {
            case 0: return Protobuf.pop_varint;
            case 1: return Protobuf.pop_64bits;
            case 2: return Protobuf.pop_string;
            case 5: return Protobuf.pop_32bits;
            default: return null;
        }
    }
};
