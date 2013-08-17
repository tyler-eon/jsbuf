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
     * Returns [Varint, NewIdx], where Varint is varint field data and NewIdx is
     * the index, in respect to the payload, where the pop completed.
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

    wire_decode: function(type) {
        switch (type) {
            case 0: return Protobuf.pop_varint;
            default: return null;
        }
    }
};
