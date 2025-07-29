import axios from 'axios';

const KRATOS_PUBLIC_URL = process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL;

export const startLoginFlow = async (setFlowId, setCsrfToken, setError) => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('flow');

  if (id) {
    setFlowId(id);
    try {
      const res = await axios.get(`${KRATOS_PUBLIC_URL}/self-service/login/flows?id=${id}`, {
        withCredentials: true,
      });

      const csrfNode = res.data.ui.nodes.find(
        (n) => n.attributes.name === 'csrf_token'
      );
      if (csrfNode) setCsrfToken(csrfNode.attributes.value);
    } catch (err) {
      setError('Failed to load login flow.');
    }
  } else {
    try {
      const res = await axios.get(`${KRATOS_PUBLIC_URL}/self-service/login/browser`, {
        withCredentials: true,
      });
      window.location.href = res.request.responseURL;
    } catch (err) {
      setError('Could not start login flow.');
    }
  }
};


export const startRegisterFlow = async (setFlowId, setCsrfToken, setError) => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('flow');
  
    if (id) {
      setFlowId(id);
      try {
        const res = await axios.get(`${KRATOS_PUBLIC_URL}/self-service/registration/flows?id=${id}`, {
          withCredentials: true,
        });
        const csrfNode = res.data.ui.nodes.find(n => n.attributes.name === 'csrf_token');
        if (csrfNode) setCsrfToken(csrfNode.attributes.value);
      } catch (err) {
        setError('Failed to load registration flow.');
      }
    } else {
      try {
        const res = await axios.get(`${KRATOS_PUBLIC_URL}/self-service/registration/browser`, {
          withCredentials: true,
        });
        window.location.href = res.request.responseURL;
      } catch (err) {
        setError('Could not start registration flow.');
      }
    }
  };