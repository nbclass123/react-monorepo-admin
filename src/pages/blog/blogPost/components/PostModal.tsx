import { App, Button, Drawer, Form, Input, Modal, Select } from "antd";
import { useCallback, useEffect, useState } from "react";

import {
  type BlogCategoryVo,
  type BlogPostReq,
  type BlogPostVo,
  type BlogTagVo,
  createPost,
  getCategoryList,
  getTagList,
  updatePost
} from "@/api/module/blog";

interface PostModalProps {
  visible: boolean;
  mode: "create" | "edit" | "view";
  data: BlogPostVo | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PostModal = ({ visible, mode, data, onClose, onSuccess }: PostModalProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const [categories, setCategories] = useState<BlogCategoryVo[]>([]);
  const [tags, setTags] = useState<BlogTagVo[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await getCategoryList({ page: 1, size: 100 });
      if (res?.data?.list) {
        setCategories(res.data.list);
      }
    } catch {
      message.error("获取分类列表失败");
    } finally {
      setLoadingCategories(false);
    }
  }, [message]);

  const fetchTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const res = await getTagList({ page: 1, size: 100 });
      if (res?.data?.list) {
        setTags(res.data.list);
      }
    } catch {
      message.error("获取标签列表失败");
    } finally {
      setLoadingTags(false);
    }
  }, [message]);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      fetchTags();
    }
  }, [visible, fetchCategories, fetchTags]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (data && (mode === "edit" || mode === "view")) {
        const formData = {
          ...data,
          tagIds: data.tagIds || []
        };
        form.setFieldsValue(formData);
      }
    }
  }, [visible, mode, data, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData: BlogPostReq = {
        ...values,
        tagIds: values.tagIds?.join(",") || ""
      };

      if (mode === "create") {
        await createPost(submitData);
        message.success("创建成功");
      } else if (mode === "edit") {
        await updatePost({ ...submitData, id: data!.id });
        message.success("更新成功");
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      message.error("操作失败");
    }
  };

  const isComplexMode = mode !== "view";

  return (
    <>
      {isComplexMode ? (
        <Drawer
          title={mode === "create" ? "新增文章" : "编辑文章"}
          placement="right"
          styles={{ wrapper: { width: 600 } }}
          open={visible}
          onClose={onClose}
          destroyOnHidden
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" onClick={handleOk}>
                确定
              </Button>
            </div>
          }
        >
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: "请输入标题" }]}
            >
              <Input placeholder="请输入文章标题" />
            </Form.Item>

            <Form.Item
              name="summary"
              label="摘要"
              rules={[{ required: true, message: "请输入摘要" }]}
            >
              <Input.TextArea rows={3} placeholder="请输入文章摘要" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="分类"
              rules={[{ required: true, message: "请选择分类" }]}
            >
              <Select
                placeholder="请选择分类"
                loading={loadingCategories}
                options={categories.map((c) => ({
                  key: c.id,
                  label: c.categoryName,
                  value: c.id
                }))}
              />
            </Form.Item>

            <Form.Item
              name="tagIds"
              label="标签"
              rules={[{ required: true, message: "请选择标签" }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择标签（可多选）"
                loading={loadingTags}
                options={tags.map((t) => ({
                  key: t.id,
                  label: t.tagName,
                  value: t.id
                }))}
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="内容"
              rules={[{ required: true, message: "请输入内容" }]}
            >
              <Input.TextArea rows={8} placeholder="请输入文章内容" />
            </Form.Item>

            <Form.Item name="coverUrl" label="封面URL">
              <Input placeholder="请输入封面图片URL" />
            </Form.Item>

            <Form.Item name="isTop" label="是否置顶" initialValue={0}>
              <Select
                options={[
                  { label: "否", value: 0 },
                  { label: "是", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="isCommentEnabled" label="允许评论" initialValue={1}>
              <Select
                options={[
                  { label: "关闭", value: 0 },
                  { label: "开启", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="status" label="状态" initialValue={0}>
              <Select
                options={[
                  { label: "草稿", value: 0 },
                  { label: "已发布", value: 1 },
                  { label: "已下线", value: 2 }
                ]}
              />
            </Form.Item>
          </Form>
        </Drawer>
      ) : (
        <Modal
          title="查看文章"
          open={visible}
          onCancel={onClose}
          footer={
            <Button type="primary" onClick={onClose}>
              关闭
            </Button>
          }
          destroyOnHidden
          width={640}
        >
          <Form form={form} layout="vertical" disabled>
            <Form.Item name="title" label="标题">
              <Input />
            </Form.Item>

            <Form.Item name="summary" label="摘要">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item name="categoryId" label="分类">
              <Select
                options={categories.map((c) => ({
                  key: c.id,
                  label: c.categoryName,
                  value: c.id
                }))}
              />
            </Form.Item>

            <Form.Item name="tagIds" label="标签">
              <Select mode="multiple" />
            </Form.Item>

            <Form.Item name="content" label="内容">
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item name="coverUrl" label="封面URL">
              <Input />
            </Form.Item>

            <Form.Item name="isTop" label="是否置顶">
              <Select
                options={[
                  { label: "否", value: 0 },
                  { label: "是", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="isCommentEnabled" label="允许评论">
              <Select
                options={[
                  { label: "关闭", value: 0 },
                  { label: "开启", value: 1 }
                ]}
              />
            </Form.Item>

            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { label: "草稿", value: 0 },
                  { label: "已发布", value: 1 },
                  { label: "已下线", value: 2 }
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default PostModal;
