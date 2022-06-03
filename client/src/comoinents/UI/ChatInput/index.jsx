import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Input, Button } from "antd";
import {
  SmileOutlined,
  CameraOutlined,
  AudioOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { UploadField } from "@navjobs/upload";
import data from "@emoji-mart/data";
import { Picker, Emoji } from "emoji-mart";
import styles from "./ChatInput.module.sass";
import { useDispatch, useSelector } from "react-redux";
import { messagesActions } from "../../../redux/actions";

function EmojiPicker(props) {
  const ref = useRef();

  useEffect(() => {
    new Picker({ ...props, data, ref });
  }, []);

  return <div ref={ref} />;
}

const ChatInput = () => {
  // useState
  const [value, setValue] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  // useSelector
  const currentDialogId = useSelector((state) => state.dialogs.currentDialogId);
  // useDispatch
  const dispatch = useDispatch();
  // handlers
  const onSendMessage = (e) => {
    if (e.keyCode === 13) {
      dispatch(messagesActions.fetchSendMessage(value, currentDialogId));
      setValue("");
    }
  };

  return (
    <div className={classNames(styles.input)}>
      <div className={classNames(styles.smile)}>
        <Button
          type="link"
          shape="circle"
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
        >
          {emojiPickerVisible && <EmojiPicker set="emojione" />}

          <SmileOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
        </Button>
      </div>
      <Input
        size="large"
        placeholder="Write your message here"
        onChange={(e) => setValue(e.target.value)}
        onKeyUp={onSendMessage}
        value={value}
      />
      <div className={classNames(styles.actions)}>
        <UploadField
          onFiles={(files) => console.log(files)}
          containerProps={{
            className: "photos",
          }}
          uploadProps={{
            accept: ".png,.jpg,.jpeg,.gif,.bmp",
            multiple: "multiple",
          }}
        >
          <Button type="link" shape="circle">
            <CameraOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
          </Button>
        </UploadField>

        {value.length ? (
          <Button
            type="link"
            shape="circle"
            onClick={() => {
              dispatch(
                messagesActions.fetchSendMessage(value, currentDialogId)
              );
              setValue("");
            }}
          >
            <SendOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
          </Button>
        ) : (
          <Button type="link" shape="circle">
            <AudioOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
          </Button>
        )}
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  online: PropTypes.bool,
};

export default ChatInput;
