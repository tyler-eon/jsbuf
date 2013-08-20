jsbuf
=====

Provides a simple JavaScript library for encoding and decoding messages
using [Google's Protocol Buffers][protobuf]. This is heavily influenced by
[eprotoc][eprotoc], a protobuf generator for Erlang.

## Decoding

Incoming messages are expected to be binary strings. In terms of JavaScript
strings I mean that each character accessible by `charCodeAt` is a single byte
of binary data. Given a binary string, the decoding process will return a
JavaScript array with each element representing a field in the message. Each
element will contain the field number, type, and value. The array of field data
is *not* guaranteed to be sorted.

    // Assume a message with two fields, both varint types.
    var msg = Protobuf.decode(bstr);
    msg[0] == [1, 0, 150];
    msg[1] == [2, 0, 96];

The format for each field element is `[FieldNum, WireType, Value]`. So in the
example the resulting message data happens to have the first element by the
first field, with a varint wire type, and a value of 150. The second element is
the second field, also with a varint wire type, and a value of 96.

Using the `jsbuf` generator you can create a helper script that will decode
message data to JavaScript objects where fields can be accessed by their name or
field number.

## Encoding

Encode an array of field data to a binary string that can be sent over the wire
using as a protocol buffer message. Field data must look like `[FieldNum, Type,
Value]`.

    var fields = [ [1, "varint", 150], [2, "uint32", 96] ];
    Protobuf.encode(fields);

The field data does *not* need to be sorted by field number prior to encoding.
The protocol buffer format does not require it, since part of each field's
"header" data you must include the field number. It is also important to note
that the `Type` element is a string representing the type of the field as
declared in the proto message definition, and not the raw wire type. This is
because the different declared field types have different encoding methods
despite some of them sharing an underlying wire type.

Using the `jsbuf` generator you can create a helper script that will encode
JavaScript objects to binary strings based on your `*.proto` files. The biggest
benefit to this is not having to manually determine field types as the helper
objects will perform the appropriate mappings for encoding.

## Generator

The sweet spot of this project is the helper class generator. Using your
`*.proto` files you can create a helper class for each message type defined.
These classes ensure only attributes defined in the proto file can be set, as
well as giving the developer accessed to named fields. Finally, these helper
classes will have two other convenience functions: easy encoding and decoding.

[protobuf]: https://developers.google.com/protocol-buffers/
[eprotoc]: https://github.com/jeremyong/eprotoc

